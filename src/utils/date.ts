import type { Todo } from '../types';

// Due dates are stored as local YYYY-MM-DD strings, so plain string comparison orders them.

export function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export type DueTone = 'overdue' | 'today' | 'soon' | 'later';

export function dueInfo(due: string, today: string): { label: string; tone: DueTone } {
  const date = parseISODate(due);
  const short = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: due.slice(0, 4) === today.slice(0, 4) ? undefined : 'numeric',
  });
  if (due < today) return { label: `Overdue · ${short}`, tone: 'overdue' };
  if (due === today) return { label: 'Today', tone: 'today' };
  if (due === addDaysISO(today, 1)) return { label: 'Tomorrow', tone: 'soon' };
  return { label: short, tone: 'later' };
}

/** The "Today" view: due today, plus anything overdue that isn't done yet. */
export function inTodayView(todo: Todo, today: string): boolean {
  if (!todo.dueDate) return false;
  return todo.dueDate === today || (todo.dueDate < today && !todo.completed);
}
