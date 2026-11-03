import type { Project, Task } from '../types';

export interface GamificationStats {
  status: { todo: number; inProgress: number; done: number };
  overdue: number;
  tasksCreated: number;
  projectsCompleted: number;
}

export const collectTasks = (projects: Project[]): { task: Task; project: Project }[] => {
  const rows: { task: Task; project: Project }[] = [];
  projects.forEach((p) => {
    (p.tasks ?? []).forEach((t) => rows.push({ task: t, project: p }));
  });
  return rows;
};

export const computeStats = (projects: Project[]): GamificationStats => {
  const now = new Date();
  const status = { todo: 0, inProgress: 0, done: 0 };
  let overdue = 0;

  collectTasks(projects).forEach(({ task }) => {
    if (task.status === 'done') status.done += 1;
    else if (task.status === 'in_progress') status.inProgress += 1;
    else status.todo += 1;
    if (task.status !== 'done' && task.due_date && new Date(task.due_date) < now) {
      overdue += 1;
    }
  });

  return {
    status,
    overdue,
    tasksCreated: status.todo + status.inProgress + status.done,
    projectsCompleted: projects.filter((p) => p.status === 'completed').length,
  };
};

/* ---------------- XP & Levels ---------------- */

export const XP_PER_DONE_TASK = 20;
export const XP_PER_COMPLETED_PROJECT = 50;

export const levelTitle = (level: number): string => {
  if (level >= 30) return 'Legendary Builder';
  if (level >= 20) return 'Master Builder';
  if (level >= 12) return 'Project Champion';
  if (level >= 8) return 'Team Powerhouse';
  if (level >= 5) return 'Rising Star';
  if (level >= 2) return 'Momentum Maker';
  return 'Newcomer';
};

const XP_PER_LEVEL = 100;

export const levelFromXp = (xp: number) => {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    toNext: XP_PER_LEVEL - intoLevel,
    pct: intoLevel / XP_PER_LEVEL * 100,
    xpPerLevel: XP_PER_LEVEL,
  };
};

/* ---------------- Milestones ---------------- */

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: 'flame' | 'star' | 'medal' | 'trophy' | 'clean' | 'crown' | 'zap';
  reward: number;
  src: 'done' | 'created' | 'projects' | 'overdue';
  /** required value of the source stat */
  target: number;
  /** compare with greater equal */
  mode: 'gte';
  predicate?: (s: GamificationStats) => boolean;
}

export const MILESTONES: Milestone[] = [
  { id: 'first-task', title: 'First Task Done', description: 'Complete your very first task.', icon: 'star', reward: 25, src: 'done', target: 1, mode: 'gte' },
  { id: 'momentum', title: 'Momentum', description: 'Complete 10 tasks.', icon: 'flame', reward: 50, src: 'done', target: 10, mode: 'gte' },
  { id: 'deliverer', title: 'Deliverer', description: 'Complete 25 tasks.', icon: 'medal', reward: 100, src: 'done', target: 25, mode: 'gte' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Complete 50 tasks.', icon: 'trophy', reward: 150, src: 'done', target: 50, mode: 'gte' },
  { id: 'taskmaster', title: 'Taskmaster', description: 'Have 20 tasks on your plate (all statuses).', icon: 'zap', reward: 50, src: 'created', target: 20, mode: 'gte' },
  { id: 'clean-slate', title: 'Clean Slate', description: 'No overdue tasks across all your projects.', icon: 'clean', reward: 75, src: 'overdue', target: 0, mode: 'gte', predicate: undefined },
  { id: 'project-pro', title: 'Project Pro', description: 'Deliver one completed project.', icon: 'crown', reward: 100, src: 'projects', target: 1, mode: 'gte' },
];

const valueFor = (s: GamificationStats, m: Milestone): number => {
  switch (m.src) {
    case 'done': return s.status.done;
    case 'created': return s.tasksCreated;
    case 'projects': return s.projectsCompleted;
    case 'overdue': return s.overdue;
    default: return 0;
  }
};

export interface MilestoneProgress {
  milestone: Milestone;
  unlocked: boolean;
  value: number;
  pct: number;
  done: boolean;
}

export const evaluateMilestones = (projects: Project[]): MilestoneProgress[] => {
  const stats = computeStats(projects);
  return MILESTONES.map((m) => {
    const value = valueFor(stats, m);
    let unlocked = value >= m.target;
    if (m.id === 'clean-slate') {
      unlocked = stats.tasksCreated >= 5 && stats.overdue === 0;
    }
    const pct = Math.min(100, Math.round((value / Math.max(1, m.target)) * 100));
    return { milestone: m, unlocked, value, pct, done: unlocked };
  });
};

export const xpFromStats = (projects: Project[]): number => {
  const s = computeStats(projects);
  const bonus = s.overdue === 0 && s.tasksCreated > 0 ? 25 : 0;
  return s.status.done * XP_PER_DONE_TASK + s.projectsCompleted * XP_PER_COMPLETED_PROJECT + bonus;
};
