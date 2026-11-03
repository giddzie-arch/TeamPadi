import React, { useState } from 'react';
import type { Project } from '../types';

interface ChatDropdownProps {
  projects: Project[];
}

interface ChatMember {
  id: number;
  name: string;
  email?: string | null;
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

const colorFor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

export const ChatDropdown: React.FC<ChatDropdownProps> = ({ projects }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Group members per project from task assignees + project owner
  const groups = projects.map((p) => {
    const members = new Map<number, ChatMember>();
    if (p.user) members.set(p.user.id, { id: p.user.id, name: p.user.name, email: p.user.email });
    (p.tasks ?? []).forEach((t) => {
      if (t.assignee) members.set(t.assignee.id, t.assignee);
    });
    return {
      project: p,
      members: Array.from(members.values()),
    };
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        title="Team chat"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        {groups.length > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden max-h-[75vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Team Chat</h3>
              <p className="text-[11px] text-gray-500">Members grouped by project</p>
            </div>

            <div className="overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No conversations available yet.</p>
              ) : (
                groups.map(({ project, members }) => (
                  <div key={project.id} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setExpanded((v) => (v === project.id ? null : project.id))}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{project.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400">{expanded === project.id ? '−' : '+'}</span>
                    </button>

                    {expanded === project.id && (
                      <div className="bg-slate-50 px-4 py-2 space-y-1">
                        {members.length === 0 ? (
                          <p className="text-[11px] text-gray-400 py-2">No members assigned yet.</p>
                        ) : (
                          members.map((m) => (
                            <a
                              key={m.id}
                              href={m.email ? `mailto:${m.email}` : undefined}
                              className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-blue-50 transition-colors group"
                            >
                              <div className={`h-7 w-7 rounded-full ${colorFor(m.name)} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                                {initialsOf(m.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-800 truncate">{m.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{m.email || '—'}</p>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-slate-400">
                1:1 Messaging & Sync will arrive with the integration milestone this quarter.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
