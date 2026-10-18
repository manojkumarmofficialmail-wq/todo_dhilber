import { useRef, useState, type KeyboardEvent } from 'react';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  // Set once an edit is saved or cancelled, so the blur fired as the input closes is ignored.
  const finished = useRef(false);

  const startEditing = () => {
    finished.current = false;
    setDraft(todo.text);
    setEditing(true);
  };

  const finish = (shouldSave: boolean) => {
    if (finished.current) return;
    finished.current = true;
    if (shouldSave) onEdit(todo.id, draft);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  };

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
      {editing ? (
        <input
          className="edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => finish(true)}
          onKeyDown={handleKeyDown}
          aria-label="Edit task"
          autoFocus
        />
      ) : (
        <>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`Mark "${todo.text}" as ${todo.completed ? 'not done' : 'done'}`}
          />
          <span className="text" onDoubleClick={startEditing} title="Double-click to edit">
            {todo.text}
          </span>
          <button
            className="delete"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.text}"`}
          >
            ×
          </button>
        </>
      )}
    </li>
  );
}
