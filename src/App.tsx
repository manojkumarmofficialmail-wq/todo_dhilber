import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import type { Filter } from './types';
import './App.css';

export default function App() {
  const { todos, addTodo, toggleTodo, editTodo, deleteTodo, clearCompleted } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  );
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <main className="app">
      <h1>To Do</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={visible} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} />
      {todos.length > 0 && (
        <FilterBar
          filter={filter}
          onChange={setFilter}
          activeCount={activeCount}
          hasCompleted={activeCount < todos.length}
          onClearCompleted={clearCompleted}
        />
      )}
    </main>
  );
}
