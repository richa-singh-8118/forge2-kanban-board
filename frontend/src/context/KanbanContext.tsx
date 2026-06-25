import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Board, Member, Tag } from '../utils/types';
import * as api from '../services/api';

interface KanbanContextType {
  boards: Board[];
  activeBoard: Board | null;
  members: Member[];
  tags: Tag[];
  loading: boolean;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: number) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchTags: () => Promise<void>;
  setActiveBoard: (board: Board | null) => void;
  refreshBoard: () => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

export function KanbanProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBoards();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoard = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getBoard(id);
      setActiveBoard(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBoard = useCallback(async () => {
    if (activeBoard?.id) {
      const data = await api.getBoard(activeBoard.id);
      setActiveBoard(data);
    }
  }, [activeBoard?.id]);

  const fetchMembers = useCallback(async () => {
    const data = await api.getMembers();
    setMembers(data);
  }, []);

  const fetchTags = useCallback(async () => {
    const data = await api.getTags();
    setTags(data);
  }, []);

  return (
    <KanbanContext.Provider value={{ boards, activeBoard, members, tags, loading, fetchBoards, fetchBoard, fetchMembers, fetchTags, setActiveBoard, refreshBoard }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used within KanbanProvider');
  return ctx;
}
