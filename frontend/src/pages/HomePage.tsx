import React, { useEffect, useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import * as api from '../services/api';
import { Modal, Input, Button } from '../components/UI';
import { BoardPage } from './BoardPage';
import { LayoutDashboard, Plus, Trash2, ChevronRight, Layers, Pencil } from 'lucide-react';

export function HomePage() {
  const { boards, activeBoard, fetchBoards, fetchBoard, setActiveBoard, loading } = useKanban();
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<{ id: number; name: string } | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const board = await api.createBoard({ name: newBoardName.trim() });
      await fetchBoards();
      await fetchBoard(board.id);
      setNewBoardName('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete this board and all its data?')) return;
    setDeleting(id);
    try {
      await api.deleteBoard(id);
      if (activeBoard?.id === id) setActiveBoard(null);
      await fetchBoards();
    } finally {
      setDeleting(null);
    }
  };

  const handleEditBoard = async () => {
    if (!showEdit || !showEdit.name.trim()) return;
    setCreating(true);
    try {
      await api.updateBoard(showEdit.id, { name: showEdit.name.trim() });
      await fetchBoards();
      if (activeBoard?.id === showEdit.id) await fetchBoard(showEdit.id);
      setShowEdit(null);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/35 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r border-slate-200/60 flex flex-col shadow-xs backdrop-blur-md z-10">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">KanbanFlow</h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workspace</p>
            </div>
          </div>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-5 mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Boards</span>
            <button
              onClick={() => setShowCreate(true)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
              title="Create Board"
            >
              <Plus size={15} />
            </button>
          </div>

          {loading && boards.length === 0 && (
            <div className="px-5 py-2">
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-9 bg-slate-100 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {boards.length === 0 && !loading && (
            <div className="px-5 py-8 text-center">
              <LayoutDashboard size={28} className="mx-auto mb-2 text-slate-350" />
              <p className="text-xs text-slate-450 leading-relaxed">No boards yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition"
              >
                Create your first board
              </button>
            </div>
          )}

          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => fetchBoard(board.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchBoard(board.id); }}
              className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-all group cursor-pointer ${
                activeBoard?.id === board.id
                  ? 'bg-indigo-50/60 text-indigo-700 font-semibold border-r-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeBoard?.id === board.id ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <span className="truncate">{board.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEdit({ id: board.id, name: board.name }); }}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Edit Board"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => handleDeleteBoard(e, board.id)}
                  className="p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded transition"
                  title="Delete Board"
                >
                  {deleting === board.id
                    ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                    : <Trash2 size={12} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-750 font-bold py-2 hover:bg-indigo-50/50 rounded-xl transition cursor-pointer border border-dashed border-indigo-200/50"
          >
            <Plus size={15} /> New Board
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100/35 relative">
        {/* Background gradient decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/10 rounded-full blur-3xl pointer-events-none" />
        <BoardPage />
      </main>

      {/* Create Board Modal */}
      {showCreate && (
        <Modal title="Create New Board" onClose={() => setShowCreate(false)}>
          <div className="space-y-4 animate-slide-in">
            <Input
              label="Board Name"
              placeholder="e.g. Product Roadmap, Sprint 1..."
              autoFocus
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateBoard(); }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button loading={creating} onClick={handleCreateBoard} className="bg-indigo-600 hover:bg-indigo-700">Create Board</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Edit Board Modal */}
      {showEdit && (
        <Modal title="Edit Board Name" onClose={() => setShowEdit(null)}>
          <div className="space-y-4 animate-slide-in">
            <Input
              label="Board Name"
              autoFocus
              value={showEdit.name}
              onChange={e => setShowEdit({ ...showEdit, name: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') handleEditBoard(); }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowEdit(null)}>Cancel</Button>
              <Button loading={creating} onClick={handleEditBoard} className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
