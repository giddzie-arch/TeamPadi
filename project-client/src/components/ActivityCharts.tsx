import React from 'react';
import type { Project } from '../types';
import type { ProjectFilter } from './ProjectsView';

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

interface ActivityStats {
  totalProjects: number;
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export const computeStats = (projects: Project[]): ActivityStats => {
  const now = new Date();
  let totalTasks = 0;
  let todo = 0;
  let inProgress = 0;
  let done = 0;
  let overdue = 0;

  projects.forEach((p) => {
    (p.tasks ?? []).forEach((t) => {
      totalTasks += 1;
      if (t.status === 'done') done += 1;
      else if (t.status === 'in_progress') inProgress += 1;
      else todo += 1;
      if (t.status !== 'done' && t.due_date && new Date(t.due_date) < now) {
        overdue += 1;
      }
    });
  });

  return {
    totalProjects: projects.length,
    totalTasks,
    todo,
    inProgress,
    done,
    overdue,
  };
};

export const SummaryCards: React.FC<{
  projects: Project[];
  onCardClick?: (filter: ProjectFilter) => void;
}> = ({ projects, onCardClick }) => {
  const stats = computeStats(projects);

  const cards: { label: string; value: number; accent: string; bg: string; filter: ProjectFilter }[] = [
    { label: 'Active Projects', value: stats.totalProjects, accent: 'text-blue-600', bg: 'bg-blue-50', filter: 'all' },
    { label: 'Total Tasks', value: stats.totalTasks, accent: 'text-violet-600', bg: 'bg-violet-50', filter: 'tasks' },
    { label: 'Completed', value: stats.done, accent: 'text-green-600', bg: 'bg-green-50', filter: 'completed' },
    { label: 'Overdue', value: stats.overdue, accent: 'text-red-600', bg: 'bg-red-50', filter: 'overdue' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <button
          key={c.label}
          onClick={() => onCardClick && onCardClick(c.filter)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left hover:border-blue-300 hover:shadow transition-all group"
          title={`View projects with ${c.label.toLowerCase()}`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.accent}`}>{c.value}</p>
          <div className={`mt-2 h-1.5 rounded-full ${c.bg} w-10 group-hover:w-16 transition-all`} />
        </button>
      ))}
    </div>
  );
};

export const StatusDonut: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const stats = computeStats(projects);
  const data: StatusCount[] = [
    { name: 'Done', value: stats.done, color: '#16a34a' },
    { name: 'In Progress', value: stats.inProgress, color: '#2563eb' },
    { name: 'To Do', value: stats.todo, color: '#cbd5e1' },
  ];
  const total = stats.done + stats.inProgress + stats.todo;
  const radius = 60;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Task Status Overview</h3>
      {total === 0 ? (
        <div className="text-center py-10 text-xs text-gray-400">No tasks yet — create tasks to see stats.</div>
      ) : (
        <div className="flex items-center gap-6">
          <svg width="150" height="150" viewBox="0 0 150 150" className="shrink-0">
            <circle cx="75" cy="75" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            {data.map((d) => {
              const len = total === 0 ? 0 : (d.value / total) * circumference;
              const offset = circumference - offsetAcc;
              offsetAcc += len;
              if (d.value === 0) return null;
              return (
                <circle
                  key={d.name}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${circumference - len}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 75 75)"
                  strokeLinecap="butt"
                />
              );
            })}
            <text x="75" y="72" textAnchor="middle" className="fill-gray-900" style={{ fontSize: 22, fontWeight: 700 }}>
              {total}
            </text>
            <text x="75" y="92" textAnchor="middle" className="fill-gray-500" style={{ fontSize: 11 }}>
              Tasks
            </text>
          </svg>
          <div className="space-y-2 flex-1">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-600 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="text-gray-900 font-semibold">
                  {d.value} <span className="text-gray-400 font-normal">({pct(d.value)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PRIORITY_CONFIG = [
  { key: 'high', label: 'High', color: '#ef4444' },
  { key: 'medium', label: 'Medium', color: '#f59e0b' },
  { key: 'low', label: 'Low', color: '#94a3b8' },
] as const;

export const PriorityBars: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  projects.forEach((p) => {
    (p.tasks ?? []).forEach((t) => {
      counts[t.priority] = (counts[t.priority] ?? 0) + 1;
    });
  });
  const max = Math.max(1, ...Object.values(counts));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
      <div className="space-y-4">
        {PRIORITY_CONFIG.map((p) => (
          <div key={p.key}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-gray-600">{p.label}</span>
              <span className={`font-bold ${p.key === 'high' ? 'text-red-500' : p.key === 'medium' ? 'text-amber-500' : 'text-slate-500'}`}>
                {counts[p.key]}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(counts[p.key] / max) * 100}%`, backgroundColor: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProjectProgressList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const withTasks = projects.filter((p) => (p.tasks?.length ?? 0) > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Project Progress</h3>
      {withTasks.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">No projects with tasks yet.</div>
      ) : (
        <div className="space-y-4">
          {withTasks.map((p) => {
            const tasks = p.tasks ?? [];
            const done = tasks.filter((t) => t.status === 'done').length;
            const pct = Math.round((done / tasks.length) * 100);
            const doneAll = p.status === 'completed';
            return (
              <div key={p.id}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[70%]">{p.name}</span>
                  <span className="text-xs text-gray-400">
                    {done}/{tasks.length} · <span className={pct === 100 ? 'text-green-600 font-semibold' : 'text-gray-600 font-semibold'}>{pct}%</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${doneAll ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface Deadline {
  id: number;
  title: string;
  project: string;
  due: Date;
  priority: string;
  assignee?: string | null;
}

export const UpcomingDeadlines: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const now = new Date();
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 14);

  const deadlines: Deadline[] = [];
  projects.forEach((p) => {
    (p.tasks ?? []).forEach((t) => {
      if (!t.due_date || t.status === 'done') return;
      const due = new Date(t.due_date);
      if (due >= now && due <= weekAhead) {
        deadlines.push({
          id: t.id,
          title: t.title,
          project: p.name,
          due,
          priority: t.priority,
          assignee: t.assignee?.name ?? null,
        });
      }
    });
  });
  deadlines.sort((a, b) => a.due.getTime() - b.due.getTime());

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Upcoming Deadlines (14 days)</h3>
      {deadlines.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">No deadlines in the next two weeks. Take a breath.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {deadlines.slice(0, 6).map((d) => {
            const daysLeft = Math.max(0, Math.ceil((d.due.getTime() - now.getTime()) / 86400000));
            return (
              <div key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{d.title}</p>
                  <p className="text-[11px] text-gray-400 truncate">{d.project}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${daysLeft <= 2 ? 'text-red-500' : daysLeft <= 5 ? 'text-amber-500' : 'text-gray-500'}`}>
                    {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                  </p>
                  <p className="text-[11px] text-gray-400">{d.due.toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
