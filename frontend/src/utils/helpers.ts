import { isPast, parseISO, isToday } from 'date-fns';

export function isOverdue(due_date: string | null): boolean {
  if (!due_date) return false;
  const date = parseISO(due_date);
  return isPast(date) && !isToday(date);
}

export function isDueToday(due_date: string | null): boolean {
  if (!due_date) return false;
  return isToday(parseISO(due_date));
}

export function formatDate(due_date: string | null): string {
  if (!due_date) return '';
  const date = parseISO(due_date);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
