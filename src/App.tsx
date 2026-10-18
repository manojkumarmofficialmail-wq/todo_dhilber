import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import type { Filter } from './types';
import './App.css';

const today = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function App() {
  const { todos, addTodo, toggleTodo, editTodo, deleteTodo, clearCompleted } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  );
  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.length - activeCount;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <div className="page">
      <main className="app">
        <header className="app-header">
          <div>
            <p className="date">{today}</p>
            <h1>My Tasks</h1>
          </div>
          {todos.length > 0 && (
            <div className="progress-label">
              <strong>{progress}%</strong>
              <span>
                {doneCount} of {todos.length} done
              </span>
            </div>
          )}
        </header>

        {todos.length > 0 && (
          <div
            className="progress"
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <TodoInput onAdd={addTodo} />
        <TodoList todos={visible} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} />
        {todos.length > 0 && (
          <FilterBar
            filter={filter}
            onChange={setFilter}
            activeCount={activeCount}
            hasCompleted={doneCount > 0}
            onClearCompleted={clearCompleted}
          />
        )}
      </main>
      <p className="hint">Double-click a task to edit it</p>
    </div>
  );
}
