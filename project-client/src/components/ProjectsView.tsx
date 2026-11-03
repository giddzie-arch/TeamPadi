import React from 'react';
import { Users, Timer } from 'lucide-react';
import type { Project, Task } from '../types';

export type ProjectFilter = 'all' | 'tasks' | 'completed' | 'overdue';

interface ProjectsViewProps {
  projects: Project[];
  loading: boolean;
  filter: ProjectFilter;
  showFilters?: boolean;
  onFilterChange: (f: ProjectFilter) => void;
  onOpenProject: (p: Project) => void;
  onDeleteProject: (id: number) => void;
  canManage: boolean;
}

const nearestDeadline = (tasks: Task[] | undefined): Date | null => {
  let best: Date | null = null;
  (tasks ?? []).forEach((t) => {
    if (!t.due_date || t.status === 'done') return;
    const d = new Date(t.due_date);
    if (!best || d < best) best = d;
  });
  return best;
};

const membersOf = (p: Project) => {
  const members = new Map<number, { name: string }>();
  if (p.user) members.set(p.user.id, { name: p.user.name });
  (p.tasks ?? []).forEach((t) => {
    if (t.assignee) members.set(t.assignee.id, { name: t.assignee.name });
  });
  return Array.from(members.values());
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const initialsOf = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  loading,
  filter,
  showFilters = true,
  onFilterChange,
  onOpenProject,
  onDeleteProject,
  canManage,
}) => {
  const now = new Date();

  const matches = (p: Project) => {
    const tasks = p.tasks ?? [];
    switch (filter) {
      case 'tasks': return tasks.length > 0;
      case 'completed': return tasks.some((t) => t.status === 'done');
      case 'overdue': return tasks.some(
        (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < now,
      );
      default: return true;
    }
  };

  const tabs: { key: ProjectFilter; label: string }[] = [
    { key: 'all', label: 'All Projects' },
    { key: 'tasks', label: 'With Tasks' },
    { key: 'completed', label: 'Completed Work' },
    { key: 'overdue', label: 'Overdue Alerts' },
  ];

  const visible = projects.filter(matches);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onFilterChange(t.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                filter === t.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading projects...</div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-600 font-medium mb-1">Nothing here</p>
          <p className="text-xs text-gray-400">
            No projects match this filter yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {visible.map((p) => {
            const tasks = p.tasks ?? [];
            const done = tasks.filter((t) => t.status === 'done').length;
            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            const deadline = nearestDeadline(tasks);
            const members = membersOf(p);
            const overdue = tasks.filter(
              (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < now,
            ).length;

            return (
              <div
                key={p.id}
                onClick={() => onOpenProject(p)}
                className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {/* Title + status */}
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                          p.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                      {overdue > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-red-100 text-red-700">
                          {overdue} Overdue
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {p.description || 'No description provided.'}
                    </p>

                    {/* Meta: members + deadline */}
                    <div className="flex items-center gap-6 mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {members.slice(0, 4).map((m) => (
                            <span
                              key={m.name}
                              title={m.name}
                              className={`h-5 w-5 rounded-full ${colorFor(m.name)} border-2 border-white text-[8px] font-bold text-white flex items-center justify-center`}
                            >
                              {initialsOf(m.name) || '?'}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Users size={11} />
                          {members.length}
                        </span>
                      </div>

                      {deadline && (
                        <span className={`text-[11px] flex items-center gap-1 font-medium ${
                          deadline < now ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          <Timer size={11} />
                          Next due {deadline.toLocaleDateString()}
                        </span>
                      )}
                      {!deadline && tasks.length === 0 && (
                        <span className="text-[11px] text-gray-300">No tasks scheduled</span>
                      )}
                    </div>
                  </div>

                  {/* Right: progress + actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {done}/{tasks.length} tasks · {pct}%
                      </p>
                    </div>

                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(p.id);
                        }}
                        className="text-[11px] font-medium text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete project"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-gray-300 text-xs">›</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
