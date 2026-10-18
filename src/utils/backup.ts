import type { Todo } from '../types';
import { todayISO } from './date';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    t.text.trim() !== '' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'number' &&
    (t.dueDate === undefined || (typeof t.dueDate === 'string' && DATE_RE.test(t.dueDate)))
  );
}

/**
 * Accepts a backup file ({ todos: [...] }) or a bare array (the localStorage format).
 * Invalid entries are dropped; a value with no task array at all throws.
 */
export function parseTodos(value: unknown): Todo[] {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { todos?: unknown }).todos)
      ? (value as { todos: unknown[] }).todos
      : null;
  if (!list) throw new Error('Not a task list');
  return list.filter(isTodo);
}

// FileReader rather than Blob.text(): same result, and it also works in the jsdom test environment.
export function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

export function downloadBackup(todos: Todo[]): void {
  const backup = { app: 'todo_dhiber', version: 1, exportedAt: new Date().toISOString(), todos };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todo-backup-${todayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
