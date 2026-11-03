import React from 'react';
import { Shield, Mail, Calendar, Briefcase, UserCircle2 } from 'lucide-react';
import type { User, Organization } from '../types';

interface UserSettingsProps {
  currentUser: User | null;
  currentOrg: Organization | null;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ currentUser, currentOrg }) => {
  if (!currentUser) {
    return <div className="text-sm text-gray-500">Loading profile...</div>;
  }

  const role = currentOrg?.pivot?.role || 'member';

  const fields = [
    { icon: UserCircle2, label: 'Full Name', value: currentUser.name },
    { icon: Mail, label: 'Email', value: currentUser.email },
    { icon: Briefcase, label: 'Organization', value: currentOrg?.name ?? '—' },
    { icon: Shield, label: 'Workspace Role', value: role },
    {
      icon: Calendar,
      label: 'Member Since',
      value: currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">User Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Your account profile and workspace membership.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate capitalize">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Heads up:</span> password changes and profile editing
          arrive with the account-integration milestone.
        </p>
      </div>
    </div>
  );
};
