import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

export default api;

// --- Boards ---
export const getBoards = () => api.get('/boards').then(r => r.data);
export const getBoard = (id: number) => api.get(`/boards/${id}`).then(r => r.data);
export const createBoard = (data: { name: string }) => api.post('/boards', data).then(r => r.data);
export const updateBoard = (id: number, data: { name: string }) => api.put(`/boards/${id}`, data).then(r => r.data);
export const deleteBoard = (id: number) => api.delete(`/boards/${id}`);

// --- Lists ---
export const createList = (data: { board_id: number; title: string }) => api.post('/lists', data).then(r => r.data);
export const updateList = (id: number, data: { title?: string; position?: number }) => api.put(`/lists/${id}`, data).then(r => r.data);
export const deleteList = (id: number) => api.delete(`/lists/${id}`);

// --- Cards ---
export const createCard = (data: { board_list_id: number; title: string; description?: string; due_date?: string; member_id?: number | null }) => api.post('/cards', data).then(r => r.data);
export const getCard = (id: number) => api.get(`/cards/${id}`).then(r => r.data);
export const updateCard = (id: number, data: Partial<{ title: string; description: string; due_date: string | null }>) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id: number) => api.delete(`/cards/${id}`);
export const moveCard = (id: number, data: { board_list_id: number; position: number }) => api.put(`/cards/${id}/move`, data).then(r => r.data);
export const assignMember = (id: number, member_id: number | null) => api.put(`/cards/${id}/assign`, { member_id }).then(r => r.data);
export const addTagToCard = (id: number, tag_id: number) => api.post(`/cards/${id}/tags`, { tag_id }).then(r => r.data);
export const removeTagFromCard = (id: number, tag_id: number) => api.delete(`/cards/${id}/tags/${tag_id}`).then(r => r.data);

// --- Members ---
export const getMembers = () => api.get('/members').then(r => r.data);
export const createMember = (data: { name: string; email: string }) => api.post('/members', data).then(r => r.data);

// --- Tags ---
export const getTags = () => api.get('/tags').then(r => r.data);
export const createTag = (data: { name: string; color: string }) => api.post('/tags', data).then(r => r.data);
