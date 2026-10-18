import { useRef, useState, type KeyboardEvent } from 'react';
import type { Todo } from '../types';
import { dueInfo, todayISO } from '../utils/date';
import { CalendarIcon, DueDatePicker } from './DueDatePicker';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onSetDue: (id: string, dueDate?: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onSetDue, onDelete }: Props) {
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

  const due = todo.dueDate ? dueInfo(todo.dueDate, todayISO()) : null;
  const tone = todo.completed ? 'done' : due?.tone;

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
          <div className="body">
            <span className="text" onDoubleClick={startEditing} title="Double-click to edit">
              {todo.text}
            </span>
            {due && (
              <span className={`due-chip ${tone}`}>
                <DueDatePicker
                  value={todo.dueDate}
                  onChange={(d) => onSetDue(todo.id, d)}
                  label={`Change due date for "${todo.text}"`}
                  title="Change due date"
                >
                  <CalendarIcon size={13} />
                  {due.label}
                </DueDatePicker>
                <button
                  className="due-clear"
                  onClick={() => onSetDue(todo.id, undefined)}
                  aria-label={`Remove due date from "${todo.text}"`}
                  title="Remove due date"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {!due && (
            <DueDatePicker
              onChange={(d) => onSetDue(todo.id, d)}
              label={`Set due date for "${todo.text}"`}
              title="Set a due date"
              className="icon-btn reveal"
            >
              <CalendarIcon size={18} />
            </DueDatePicker>
          )}
          <button
            className="icon-btn reveal delete"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.text}"`}
            title="Delete"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </li>
  );
}
