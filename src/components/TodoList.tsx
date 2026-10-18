import type { Todo } from '../types';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  emptyHint: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onSetDue: (id: string, dueDate?: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, emptyHint, onToggle, onEdit, onSetDue, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <div className="empty">
        <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
          <path
            d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"
            stroke="currentColor"
            strokeWidth="1.75"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p>Nothing here.</p>
        <span>{emptyHint}</span>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onSetDue={onSetDue}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
