import type { Todo } from '../types';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onEdit, onDelete }: Props) {
  if (todos.length === 0) {
    return <p className="empty">Nothing here.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
