import { useState, type FormEvent } from 'react';
import { dueInfo, todayISO } from '../utils/date';
import { CalendarIcon, DueDatePicker } from './DueDatePicker';

interface Props {
  onAdd: (text: string, dueDate?: string) => void;
  /** Used when no date is picked, e.g. today's date while the Today tab is open. */
  defaultDueDate?: string;
}

export function TodoInput({ onAdd, defaultDueDate }: Props) {
  const [text, setText] = useState('');
  const [pickedDate, setDueDate] = useState<string | undefined>();
  const dueDate = pickedDate ?? defaultDueDate;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, dueDate);
    setText('');
    setDueDate(undefined);
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={defaultDueDate ? 'Add a task for today' : 'What needs to be done?'}
        aria-label="New task"
        autoFocus
      />
      <DueDatePicker
        value={dueDate}
        onChange={setDueDate}
        label="Due date for new task"
        title="Set a due date"
        className={`input-date${dueDate ? ' has-value' : ''}`}
      >
        <CalendarIcon size={18} />
        {dueDate && <span>{dueInfo(dueDate, todayISO()).label}</span>}
      </DueDatePicker>
      <button type="submit" className="btn-primary" disabled={!text.trim()}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Add
      </button>
    </form>
  );
}
