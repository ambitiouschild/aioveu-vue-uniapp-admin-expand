export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  deadline?: string;
  priority?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt?: string;
}

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}
