export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  /** Local calendar date as YYYY-MM-DD. */
  dueDate?: string;
}

export type Filter = 'all' | 'today' | 'active' | 'completed';
