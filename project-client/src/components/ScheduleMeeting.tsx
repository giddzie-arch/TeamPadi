import React from 'react';
import { Calendar, Clock, Video } from 'lucide-react';
import type { User } from '../types';

interface ScheduleMeetingProps {
  currentUser?: User | null;
}

export const ScheduleMeeting: React.FC<ScheduleMeetingProps> = ({ currentUser }) => {
  const meetingFeats = [
    {
      icon: Video,
      title: 'Google Meet / Zoom',
      desc: 'Generate instant meeting links and attach them to any project or task thread.',
    },
    {
      icon: Clock,
      title: 'Availability Sync',
      desc: 'Cross-check calendars so invites only land on shared open slots.',
    },
    {
      icon: Calendar,
      title: 'Automated Reminders',
      desc: 'Email and in-app nudges fire ahead of every scheduled session.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Schedule a Meeting</h2>
        <p className="text-sm text-gray-500 mt-1">
          Direct meetings with your team, backed by email notifications, are on the integration
          roadmap — the connective groundwork ships first.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meetingFeats.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Icon size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Quick Session Request</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser ? `Logged in as ${currentUser.email}` : 'Not signed in'}
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-700 px-2.5 py-1 rounded-full">
            Pending Integration
          </span>
        </div>
      </div>
    </div>
  );
};
