import React from 'react';
import { Flame, Star, Medal, Trophy, Sparkles, Crown, Zap, Lock, PartyPopper } from 'lucide-react';
import type { Project } from '../types';
import {
  computeStats,
  evaluateMilestones,
  levelFromXp,
  levelTitle,
  xpFromStats,
  XP_PER_DONE_TASK,
  XP_PER_COMPLETED_PROJECT,
} from '../lib/gamification';

const ICONS: Record<string, React.ElementType> = {
  flame: Flame,
  star: Star,
  medal: Medal,
  trophy: Trophy,
  clean: Sparkles,
  crown: Crown,
  zap: Zap,
};

interface MilestonesProps {
  projects: Project[];
}

export const Milestones: React.FC<MilestonesProps> = ({ projects }) => {
  const stats = computeStats(projects);
  const steps = evaluateMilestones(projects);
  const xp = xpFromStats(projects);
  const lvl = levelFromXp(xp);
  const unlocked = steps.filter((s) => s.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Level card */}
      <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Level medal ring */}
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42 * (lvl.pct / 100)} ${2 * Math.PI * 42}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">L{lvl.level}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Level {lvl.level} · {levelTitle(lvl.level)}
                </p>
                <p className="text-3xl font-black text-white mt-0.5">{xp.toLocaleString()} XP</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lvl.toNext} XP to reach Level {lvl.level + 1}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Milestones Unlocked</p>
              <p className="text-2xl font-black text-white mt-0.5">
                {unlocked}/{steps.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Unlocked progress: {lvl.intoLevel}/{lvl.xpPerLevel} XP · {lvl.pct.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* XP formula ribbon */}
        <div className="bg-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Task done → +{XP_PER_DONE_TASK} XP
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Project completed → +{XP_PER_COMPLETED_PROJECT} XP
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Zero overdue bonus → +25 XP
          </span>
        </div>
      </div>

      {/* Milestone grid */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Milestone Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map(({ milestone: m, unlocked: done, value, pct }) => {
            const IconComp = ICONS[m.icon];
            return (
              <div
                key={m.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between transition-all ${
                  done ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                      done ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {done ? <IconComp size={22} /> : <Lock size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-600'}`}>
                        {m.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          done ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        +{m.reward} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{m.description}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>{done ? 'Completed' : `${value}/${m.target}`}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${done ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live activity stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PartyPopper size={16} className="text-pink-500" />
          Your Work Momentum
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tasks Done', value: stats.status.done, tone: 'text-green-600 bg-green-50' },
            { label: 'In Motion', value: stats.status.inProgress, tone: 'text-blue-600 bg-blue-50' },
            { label: 'Queued Up', value: stats.status.todo, tone: 'text-slate-600 bg-slate-100' },
            { label: 'Overdue', value: stats.overdue, tone: 'text-red-600 bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-4 text-center border border-gray-100">
              <p className={`text-2xl font-black ${s.tone.split(' ')[0]}`}>
                {s.value}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
