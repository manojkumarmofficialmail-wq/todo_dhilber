import { useEffect, useState } from 'react';
import type { Todo } from '../types';
import { parseTodos } from '../utils/backup';

export const STORAGE_KEY = 'todos';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseTodos(JSON.parse(raw)) : [];
  } catch {
    // Corrupt data or storage blocked: start with an empty list.
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Storage full or blocked; the app still works for this session.
    }
  }, [todos]);

  const addTodo = (text: string, dueDate?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    if (dueDate) todo.dueDate = dueDate;
    setTodos((prev) => [...prev, todo]);
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  // Saving an edit as empty text deletes the task.
  const editTodo = (id: string, text: string) => {
    const trimmed = text.trim();
    setTodos((prev) =>
      trimmed
        ? prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
        : prev.filter((t) => t.id !== id),
    );
  };

  const setDueDate = (id: string, dueDate?: string) =>
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const { dueDate: _old, ...rest } = t;
        return dueDate ? { ...rest, dueDate } : rest;
      }),
    );

  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.completed));

  /** Adds tasks from a backup that aren't already in the list. Returns how many were added. */
  const importTodos = (incoming: Todo[]): number => {
    const existing = new Set(todos.map((t) => t.id));
    const fresh = incoming.filter((t) => !existing.has(t.id));
    if (fresh.length) setTodos((prev) => [...prev, ...fresh]);
    return fresh.length;
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    editTodo,
    setDueDate,
    deleteTodo,
    clearCompleted,
    importTodos,
  };
}
