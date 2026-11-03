export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  organizations?: Organization[];
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'in_progress' | 'completed';
  tasks?: Task[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  name: string;
  industry: string | null;
  team_size: string | null;
  default_methodology: 'kanban' | 'scrum' | 'waterfall' | 'simple';
  pivot?: {
    role: 'owner' | 'admin' | 'member';
  };
}

export interface Task {
  id: number;
  project_id: number;
  assigned_to: number | null;
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const API_VERSION = 'v1';