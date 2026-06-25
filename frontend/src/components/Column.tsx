import React, { useState } from 'react';
import { BoardList } from '../utils/types';
import { useKanban } from '../context/KanbanContext';
import * as api from '../services/api';
import { CardItem } from './CardItem';
import { Button, Input } from './UI';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, MoreVertical, Check, X } from 'lucide-react';

interface SortableCardProps {
  card: import('../utils/types').Card;
  listTitle: string;
}

function SortableCard({ card, listTitle }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `card-${card.id}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardItem card={card} listTitle={listTitle} isDragging={isDragging} />
    </div>
  );
}

interface ColumnProps {
  list: BoardList;
}

export function Column({ list }: ColumnProps) {
  const { refreshBoard } = useKanban();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef } = useDroppable({ id: `list-${list.id}` });

  const cardIds = (list.cards ?? []).map(c => `card-${c.id}`);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    setSaving(true);
    try {
      await api.createCard({ board_list_id: list.id, title: newCardTitle.trim() });
      await refreshBoard();
      setNewCardTitle('');
      setIsAddingCard(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === list.title) { setIsEditing(false); return; }
    await api.updateList(list.id, { title: editTitle.trim() });
    await refreshBoard();
    setIsEditing(false);
  };

  const handleDeleteList = async () => {
    if (!confirm(`Delete list "${list.title}" and all its cards?`)) return;
    setShowMenu(false);
    await api.deleteList(list.id);
    await refreshBoard();
  };

  return (
    <div className="flex-shrink-0 w-72 bg-slate-50/95 border border-slate-200/60 shadow-xs rounded-2xl flex flex-col max-h-full transition-all">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 animate-slide-in">
            <input
              autoFocus
              className="flex-1 text-sm font-semibold bg-white border border-indigo-400 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-100 transition"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleUpdateTitle(); if (e.key === 'Escape') setIsEditing(false); }}
            />
            <button onClick={handleUpdateTitle} className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded-lg transition"><Check size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"><X size={16} /></button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm tracking-wide">{list.title}</h3>
              <span className="text-[10px] bg-slate-200/75 text-slate-600 rounded-full px-2 py-0.5 font-bold">
                {list.cards?.length ?? 0}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition"
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 w-36 z-20 animate-slide-in">
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition"
                    >
                      <Pencil size={13} /> Edit Title
                    </button>
                    <button
                      onClick={handleDeleteList}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <Trash2 size={13} /> Delete List
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 min-h-[40px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {(list.cards ?? []).map(card => (
            <SortableCard key={card.id} card={card} listTitle={list.title} />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="px-3 pb-3 pt-1">
        {isAddingCard ? (
          <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 space-y-2 animate-slide-in">
            <textarea
              autoFocus
              rows={2}
              className="w-full text-sm px-2.5 py-2 rounded-lg border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Card title..."
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); } }}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" loading={saving} onClick={handleAddCard} className="bg-indigo-600 hover:bg-indigo-700">Add Card</Button>
              <button onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all border border-dashed border-transparent hover:border-indigo-200/50 cursor-pointer"
          >
            <Plus size={15} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
