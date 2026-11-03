import React from 'react';
import { Kanban, Route, Workflow, ListOrdered, CheckCircle2 } from 'lucide-react';
import type { Organization } from '../types';

interface MethodologiesProps {
  currentOrg: Organization | null;
}

interface MethodologyInfo {
  key: 'kanban' | 'scrum' | 'waterfall' | 'simple';
  name: string;
  icon: React.ElementType;
  summary: string;
  bestFor: string;
  pillars: string[];
}

const METHODOLOGIES: MethodologyInfo[] = [
  {
    key: 'kanban',
    name: 'Kanban',
    icon: Kanban,
    summary:
      'A continuous-flow system where work moves across visual columns (To Do → In Progress → Done). Each moving card exposes bottlenecks instantly, enabling dynamic focus rather than fixed cycles.',
    bestFor: 'Teams with steady, changing workloads — support desks, agencies, product squads shipping continuously.',
    pillars: ['Visual workflow board', 'WIP limits protect focus', 'Cards pulled by readiness, not schedule'],
  },
  {
    key: 'scrum',
    name: 'Scrum',
    icon: Route,
    summary:
      'Weekly blocks that sprint to a concrete, reviewable increment. What goes into the sprint is negotiated up front, then protected — the team inspects and adapts at the finish line.',
    bestFor: 'Product teams with evolving priorities that want predictable weekly delivery rhythms.',
    pillars: ['Fixed sprints with clear goals', 'Backlog triage before commitment', 'Retros sharpen the next cycle'],
  },
  {
    key: 'waterfall',
    name: 'Waterfall',
    icon: Workflow,
    summary:
      'Phased, sequential delivery: requirements freeze before build, build before verify, verify before release. Predictability through deliberately controlled change — every step gates the next.',
    bestFor: 'Fixed-scope contracts, regulated work, and projects where late changes are costlier than planning thoroughly.',
    pillars: ['Locked, documented scope', 'Sequential phase gates', 'Baseline-aware progress tracking'],
  },
  {
    key: 'simple',
    name: 'Simple Flow',
    icon: ListOrdered,
    summary:
      'The lightweight mode: an ordered task list with owner and deadline. No ceremony, no cycles — just decide, assign, deliver, review.',
    bestFor: 'Solo professionals, small crews, and quick internal tasks that lose weight under heavier ceremony.',
    pillars: ['Flat, prioritized task list', 'Clear owner per item', 'Fast cycle from assign to done'],
  },
];

export const Methodologies: React.FC<MethodologiesProps> = ({ currentOrg }) => {
  const defaultKey = currentOrg?.default_methodology ?? 'kanban';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Methodologies Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          How your workspace gets work done.{' '}
          {currentOrg && (
            <>
              <span className="font-medium text-blue-600">{currentOrg.name}</span> defaults to{' '}
              <span className="font-semibold">{METHODOLOGIES.find((m) => m.key === defaultKey)?.name}</span>.
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {METHODOLOGIES.map((m) => {
          const isDefault = m.key === defaultKey;
          return (
            <div
              key={m.key}
              className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col ${
                isDefault ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <m.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{m.name}</h3>
                    <p className="text-[11px] text-gray-400">Best for: {m.bestFor.split('—')[0].trim()}</p>
                  </div>
                </div>
                {isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mt-3">{m.summary}</p>

              <ul className="mt-4 space-y-1.5">
                {m.pillars.map((pillar) => (
                  <li key={pillar} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 size={13} className="text-green-600 mt-0.5 shrink-0" />
                    {pillar}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-xl p-5">
        <p className="text-xs text-slate-300">
          <span className="font-semibold text-white">Changing methodology:</span> the switch lives in
          organization settings and will re-map active boards once the workspace-config milestone
          lands.
        </p>
      </div>
    </div>
  );
};
