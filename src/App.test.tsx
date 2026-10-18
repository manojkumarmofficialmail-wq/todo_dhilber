import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEY } from './hooks/useTodos';

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
