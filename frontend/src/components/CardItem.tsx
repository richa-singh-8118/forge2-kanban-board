import React, { useState } from 'react';
import { Card, Member, Tag } from '../utils/types';
import { Modal, Button } from './UI';
import { useKanban } from '../context/KanbanContext';
import * as api from '../services/api';
import { isOverdue, isDueToday } from '../utils/helpers';
import { format, parseISO } from 'date-fns';
import { Calendar, AlignLeft, User, Check, Plus, Trash2 } from 'lucide-react';

interface CardItemProps {
  card: Card;
  listTitle?: string;
  isDragging?: boolean;
}

function getMemberInitials(name: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getMemberColorClass(name: string) {
  if (!name) return 'bg-slate-100 text-slate-500 border-slate-200';
  const colors = [
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-sky-50 text-sky-700 border-sky-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-violet-50 text-violet-700 border-violet-200',
    'bg-teal-50 text-teal-700 border-teal-200',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function CardItem({ card, listTitle, isDragging = false }: CardItemProps) {
  const [showDetail, setShowDetail] = useState(false);

  const overdue = isOverdue(card.due_date);
  const dueToday = isDueToday(card.due_date);
  const completed = listTitle === 'Done';

  let statusText = '';
  if (completed) statusText = 'Completed';
  else if (overdue) statusText = 'Overdue';
  else if (dueToday) statusText = 'Due Today';

  return (
    <>
      <div
        className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs cursor-pointer hover:shadow-md hover:border-indigo-400 transition-all duration-200 group relative ${isDragging ? 'shadow-xl rotate-2 opacity-90 scale-105' : ''}`}
        onClick={() => setShowDetail(true)}
      >
        {/* Card Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {card.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors">
          {card.title}
        </h4>

        {/* Description snippet indicator */}
        {card.description && (
          <div className="flex items-start gap-1 text-slate-400 text-xs mb-3">
            <AlignLeft size={13} className="mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2 leading-relaxed text-slate-500">{card.description}</p>
          </div>
        )}

        {/* Card Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-2">
          {/* Due date badge */}
          {card.due_date ? (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${
                completed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : overdue
                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                  : dueToday
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
            >
              <Calendar size={12} />
              <span>{format(parseISO(card.due_date), 'dd MMM')}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Member Avatar */}
          {card.member ? (
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-xs select-none ${getMemberColorClass(
                card.member.name
              )}`}
              title={`Assigned to ${card.member.name}`}
            >
              {getMemberInitials(card.member.name)}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400" title="Unassigned">
              <User size={10} />
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <CardDetail card={card} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

function CardDetail({ card, onClose }: { card: Card; onClose: () => void }) {
  const { members, tags, refreshBoard } = useKanban();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [dueDate, setDueDate] = useState(card.due_date ? card.due_date.split('T')[0] : '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(card.member_id?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.updateCard(card.id, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
      });
      if (selectedMemberId !== (card.member_id?.toString() ?? '')) {
        await api.assignMember(card.id, selectedMemberId ? parseInt(selectedMemberId) : null);
      }
      await refreshBoard();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    setDeleting(true);
    try {
      await api.deleteCard(card.id);
      await refreshBoard();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleTag = async (tagId: number) => {
    const active = card.tags?.some(t => t.id === tagId);
    if (active) {
      await api.removeTagFromCard(card.id, tagId);
    } else {
      await api.addTagToCard(card.id, tagId);
    }
    await refreshBoard();
  };

  return (
    <Modal title="Edit Card" onClose={onClose}>
      <div className="space-y-5 animate-slide-in">
        {/* Title Input */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Card Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition leading-relaxed"
            placeholder="Add detailed task notes here..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Assignee & Due Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Member Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Assignee</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Due Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Tags Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => {
              const active = card.tags?.some(t => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all duration-150 cursor-pointer ${
                    active
                      ? 'text-white shadow-xs border-transparent hover:brightness-95'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  style={active ? { backgroundColor: tag.color } : {}}
                >
                  {active && <Check size={12} className="stroke-[3px]" />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-6">
          <Button variant="danger" size="md" loading={deleting} onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={15} /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="md" loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
