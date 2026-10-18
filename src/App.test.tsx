import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './hooks/useTodos';
import { addDaysISO, todayISO } from './utils/date';
import { readBlobText } from './utils/backup';

async function addTask(text: string) {
  await userEvent.type(screen.getByLabelText('New task'), `${text}{Enter}`);
}

describe('App', () => {
  it('adds a task and ignores blank input', async () => {
    render(<App />);
    await addTask('Buy milk');
    await addTask('   ');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('1 task left')).toBeInTheDocument();
  });

  it('toggles and deletes a task', async () => {
    render(<App />);
    await addTask('Walk dog');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('listitem')).toHaveClass('completed');
    expect(screen.getByText('0 tasks left')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Delete "Walk dog"'));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('edits a task on double-click', async () => {
    render(<App />);
    await addTask('Old text');
    await userEvent.dblClick(screen.getByText('Old text'));
    const edit = screen.getByLabelText('Edit task');
    await userEvent.clear(edit);
    await userEvent.type(edit, 'New text{Enter}');
    expect(screen.getByText('New text')).toBeInTheDocument();
  });

  it('cancels an edit with Escape', async () => {
    render(<App />);
    await addTask('Keep me');
    await userEvent.dblClick(screen.getByText('Keep me'));
    await userEvent.type(screen.getByLabelText('Edit task'), ' changed{Escape}');
    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  it('filters and clears completed tasks', async () => {
    render(<App />);
    await addTask('A');
    await addTask('B');
    await userEvent.click(screen.getByLabelText('Mark "A" as done'));

    await userEvent.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear completed' }));
    await userEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('saves tasks to localStorage and loads them back', async () => {
    const { unmount } = render(<App />);
    await addTask('Persist me');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].text).toBe('Persist me');

    unmount();
    render(<App />);
    expect(screen.getByText('Persist me')).toBeInTheDocument();
  });

  it('starts empty when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    render(<App />);
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });
});

describe('Due dates', () => {
  const today = todayISO();

  it('adds a task with a due date and shows it in the Today view', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Due date for new task'), { target: { value: today } });
    await addTask('Pay bills');
    await addTask('Someday task');

    const item = screen.getByText('Pay bills').closest('li')!;
    expect(within(item).getByText('Today')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].dueDate).toBe(today);

    await userEvent.click(screen.getByRole('button', { name: /^Today/ }));
    expect(screen.getByText('Pay bills')).toBeInTheDocument();
    expect(screen.queryByText('Someday task')).not.toBeInTheDocument();
  });

  it('gives tasks added on the Today tab a due date of today, and not elsewhere', async () => {
    render(<App />);
    await addTask('Undated');
    await userEvent.click(screen.getByRole('button', { name: /^Today/ }));
    expect(screen.queryByText('Undated')).not.toBeInTheDocument();

    expect(screen.getByLabelText('New task')).toHaveAttribute('placeholder', 'Add a task for today');
    await addTask('Do it today');
    const item = screen.getByText('Do it today').closest('li')!;
    expect(within(item).getByText('Today')).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.find((t: { text: string }) => t.text === 'Undated')).not.toHaveProperty('dueDate');
    expect(saved.find((t: { text: string }) => t.text === 'Do it today').dueDate).toBe(today);
  });

  it('marks past dates as overdue and keeps them in Today until done', async () => {
    render(<App />);
    await addTask('Late task');
    fireEvent.change(screen.getByLabelText('Set due date for "Late task"'), {
      target: { value: addDaysISO(today, -2) },
    });
    expect(screen.getByText(/^Overdue/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Today/ }));
    expect(screen.getByText('Late task')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Mark "Late task" as done'));
    expect(screen.queryByText('Late task')).not.toBeInTheDocument();
  });

  it('shows Tomorrow and removes a due date', async () => {
    render(<App />);
    await addTask('Call mom');
    fireEvent.change(screen.getByLabelText('Set due date for "Call mom"'), {
      target: { value: addDaysISO(today, 1) },
    });
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Remove due date from "Call mom"'));
    expect(screen.queryByText('Tomorrow')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0]).not.toHaveProperty('dueDate');
  });
});

describe('Backup', () => {
  it('exports tasks as a JSON file', async () => {
    let saved: Blob | undefined;
    const createUrl = vi.fn((blob: Blob) => {
      saved = blob;
      return 'blob:backup';
    });
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    await addTask('Back me up');
    await userEvent.click(screen.getByRole('button', { name: 'Export backup' }));

    expect(click).toHaveBeenCalled();
    const backup = JSON.parse(await readBlobText(saved!));
    expect(backup.todos[0].text).toBe('Back me up');
    expect(screen.getByRole('status')).toHaveTextContent('Saved a backup of 1 task.');
    click.mockRestore();
  });

  it('imports new tasks from a backup and skips ones already present', async () => {
    const existing = { id: 'a', text: 'Already here', completed: false, createdAt: 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    render(<App />);

    const backup = {
      todos: [
        existing,
        { id: 'b', text: 'From backup', completed: true, createdAt: 2, dueDate: '2026-01-05' },
        { id: 'c', text: '', completed: false, createdAt: 3 }, // invalid: dropped
      ],
    };
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    await userEvent.upload(screen.getByLabelText('Import backup file'), file);

    expect(await screen.findByText('Imported 1 task.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('From backup')).toBeInTheDocument();
  });

  it('rejects a file that is not a backup', async () => {
    render(<App />);
    const file = new File(['hello'], 'notes.json', { type: 'application/json' });
    await userEvent.upload(screen.getByLabelText('Import backup file'), file);
    expect(await screen.findByText("That file isn't a valid backup.")).toBeInTheDocument();
  });
});
