import React, { useEffect, useState, useCallback } from 'react';
import { useKanban } from '../context/KanbanContext';
import { Column } from '../components/Column';
import { Modal, Input, Button } from '../components/UI';
import * as api from '../services/api';
import { BoardList, Card } from '../utils/types';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { CardItem } from '../components/CardItem';
import { Plus, LayoutDashboard } from 'lucide-react';

export function BoardPage() {
  const { activeBoard, members, tags, fetchMembers, fetchTags, fetchBoard, refreshBoard } = useKanban();
  const [lists, setLists] = useState<BoardList[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchTags();
  }, []);

  useEffect(() => {
    if (activeBoard?.lists) {
      setLists(activeBoard.lists);
    }
  }, [activeBoard]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findCardAndList = useCallback((cardId: number) => {
    for (const list of lists) {
      const card = list.cards?.find(c => c.id === cardId);
      if (card) return { card, list };
    }
    return null;
  }, [lists]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith('card-')) {
      const cardId = parseInt(id.replace('card-', ''));
      const found = findCardAndList(cardId);
      if (found) setActiveCard(found.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!activeId.startsWith('card-')) return;

    const activeCardId = parseInt(activeId.replace('card-', ''));
    const overIsCard = overId.startsWith('card-');
    const overIsList = overId.startsWith('list-');

    const activeFound = findCardAndList(activeCardId);
    if (!activeFound) return;

    let overListId: number | null = null;
    if (overIsCard) {
      const overCardId = parseInt(overId.replace('card-', ''));
      const overFound = findCardAndList(overCardId);
      if (overFound) overListId = overFound.list.id;
    } else if (overIsList) {
      overListId = parseInt(overId.replace('list-', ''));
    }

    if (overListId === null || activeFound.list.id === overListId) return;

    setLists(prev => {
      return prev.map(l => {
        if (l.id === activeFound.list.id) {
          return { ...l, cards: l.cards?.filter(c => c.id !== activeCardId) };
        }
        if (l.id === overListId) {
          const updatedCard = { ...activeFound.card, board_list_id: overListId };
          return { ...l, cards: [...(l.cards ?? []), updatedCard] };
        }
        return l;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (!activeId.startsWith('card-')) return;

    const activeCardId = parseInt(activeId.replace('card-', ''));

    // Find the current list that contains the active card (after drag-over has updated state)
    let targetListId: number | null = null;
    let newPosition = 0;

    setLists(prev => {
      const newLists = prev.map(list => {
        const cardIdx = list.cards?.findIndex(c => c.id === activeCardId) ?? -1;
        if (cardIdx === -1) return list;

        targetListId = list.id;
        let cards = [...(list.cards ?? [])];

        if (overId.startsWith('card-')) {
          const overCardId = parseInt(overId.replace('card-', ''));
          const overIdx = cards.findIndex(c => c.id === overCardId);
          if (overIdx !== -1) {
            cards = arrayMove(cards, cardIdx, overIdx);
          }
        }

        // Update positions
        cards = cards.map((c, idx) => ({ ...c, position: idx }));
        newPosition = cards.findIndex(c => c.id === activeCardId);
        return { ...list, cards };
      });
      return newLists;
    });

    // Sync to backend
    if (targetListId !== null) {
      try {
        await api.moveCard(activeCardId, { board_list_id: targetListId, position: newPosition });
      } catch (e) {
        await refreshBoard();
      }
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim() || !activeBoard) return;
    setAddingList(true);
    try {
      await api.createList({ board_id: activeBoard.id, title: newListTitle.trim() });
      await refreshBoard();
      setNewListTitle('');
      setShowAddList(false);
    } finally {
      setAddingList(false);
    }
  };

  if (!activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center animate-slide-in">
          <LayoutDashboard size={48} className="mx-auto mb-4 text-slate-300 stroke-[1.5]" />
          <p className="text-base font-semibold text-slate-600">Select or create a board to get started</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">Choose a board from the sidebar or build a new workflow using the New Board action.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Board Header */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-slate-200 bg-white/60 backdrop-blur-md z-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{activeBoard.name}</h2>
        <Button size="sm" onClick={() => setShowAddList(true)} className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-xs">
          <Plus size={15} /> Add List
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 h-full items-start">
            {lists.map(list => (
              <Column key={list.id} list={list} />
            ))}
            {lists.length === 0 && !showAddList && (
              <div className="flex items-center justify-center w-full h-64 border border-dashed border-slate-300/80 rounded-2xl animate-slide-in">
                <button
                  onClick={() => setShowAddList(true)}
                  className="flex flex-col items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all font-semibold cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xs group-hover:border-indigo-200 group-hover:shadow-md transition">
                    <Plus size={20} className="text-slate-500 group-hover:text-indigo-600 transition" />
                  </div>
                  <span>Add your first list</span>
                </button>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-2 scale-105 shadow-xl">
                <CardItem card={activeCard} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add List Modal */}
      {showAddList && (
        <Modal title="Add New List" onClose={() => setShowAddList(false)}>
          <div className="space-y-4 animate-slide-in">
            <Input
              label="List Title"
              placeholder="e.g. In Progress, Done..."
              autoFocus
              value={newListTitle}
              onChange={e => setNewListTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddList(); }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowAddList(false)}>Cancel</Button>
              <Button loading={addingList} onClick={handleAddList} className="bg-indigo-600 hover:bg-indigo-700">Create List</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
