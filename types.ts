export type Priority = 'Low' | 'Medium' | 'High';
export type Category = 'Work' | 'Personal' | 'Study' | 'Other';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
}

export type FilterType = 'All' | 'Active' | 'Completed';
export type SortType = 'Newest' | 'Priority';
