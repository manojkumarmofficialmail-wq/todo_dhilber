import { useEffect, useState } from 'react';
import type { Todo } from '../types';

export const STORAGE_KEY = 'todos';

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false, createdAt: Date.now() },
    ]);
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

  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.completed));

  return { todos, addTodo, toggleTodo, editTodo, deleteTodo, clearCompleted };
}
