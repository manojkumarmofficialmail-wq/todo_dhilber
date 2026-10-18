import { useRef, useState, type ChangeEvent } from 'react';
import type { Todo } from '../types';
import { downloadBackup, parseTodos, readBlobText } from '../utils/backup';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

interface Props {
  todos: Todo[];
  onImport: (todos: Todo[]) => number;
}

/** Install button plus backup export/import, shown below the main card. */
export function AppTools({ todos, onImport }: Props) {
  const { canInstall, install } = useInstallPrompt();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const added = onImport(parseTodos(JSON.parse(await readBlobText(file))));
      setStatus({
        text: added
          ? `Imported ${added} ${added === 1 ? 'task' : 'tasks'}.`
          : 'No new tasks in that backup.',
      });
    } catch {
      setStatus({ text: "That file isn't a valid backup.", error: true });
    }
  };

  const handleExport = () => {
    downloadBackup(todos);
    setStatus({ text: `Saved a backup of ${todos.length} ${todos.length === 1 ? 'task' : 'tasks'}.` });
  };

  return (
    <div className="app-tools">
      <div className="tool-buttons">
        {canInstall && (
          <button className="tool-btn install" onClick={install}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M12 4v11M7 10l5 5 5-5M5 20h14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Install app
          </button>
        )}
        <button className="tool-btn" onClick={handleExport} disabled={todos.length === 0}>
          Export backup
        </button>
        <button className="tool-btn" onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          aria-label="Import backup file"
          hidden
          onChange={handleFile}
        />
      </div>
      <p className={`tool-status${status?.error ? ' error' : ''}`} role="status">
        {status?.text}
      </p>
    </div>
  );
}
