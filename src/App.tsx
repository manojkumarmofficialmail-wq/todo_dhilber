import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import { AppTools } from './components/AppTools';
import { inTodayView, todayISO } from './utils/date';
import type { Filter } from './types';
import './App.css';

const EMPTY_HINTS: Record<Filter, string> = {
  all: 'Add a task above to get started.',
  today: 'Tasks you add here are due today.',
  active: 'Everything is done. Nice work!',
  completed: 'Completed tasks will show up here.',
};

export default function App() {
  const { todos, addTodo, toggleTodo, editTodo, setDueDate, deleteTodo, clearCompleted, importTodos } =
    useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const today = todayISO();
  const visible = todos.filter((t) => {
    if (filter === 'today') return inTodayView(t, today);
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });
  const activeCount = todos.filter((t) => !t.completed).length;
  const todayCount = todos.filter((t) => !t.completed && inTodayView(t, today)).length;
  const doneCount = todos.length - activeCount;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page">
      <main className="app">
        <header className="app-header">
          <div>
            <p className="date">{dateLabel}</p>
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

        <TodoInput onAdd={addTodo} defaultDueDate={filter === 'today' ? today : undefined} />
        <TodoList
          todos={visible}
          emptyHint={EMPTY_HINTS[filter]}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onSetDue={setDueDate}
          onDelete={deleteTodo}
        />
        {todos.length > 0 && (
          <FilterBar
            filter={filter}
            onChange={setFilter}
            activeCount={activeCount}
            todayCount={todayCount}
            hasCompleted={doneCount > 0}
            onClearCompleted={clearCompleted}
          />
        )}
      </main>
      <AppTools todos={todos} onImport={importTodos} />
      <p className="hint">Double-click a task to edit it</p>
    </div>
  );
}
