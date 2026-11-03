import React, { useEffect, useState } from 'react';
import api from '../api/client';

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      const { data } = await api.get<TeamMember[]>('/organization/members');
      setMembers(data);
    } catch {
      setError('Failed to fetch team members.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.post('/organization/invitations', { email, role });
      setSuccess(data.message || 'Invitation sent successfully!');
      setEmail('');
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Manage Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold px-2">
            ✕
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-3">
          {error && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">{error}</div>}
          {success && <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">{success}</div>}
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-6 border-b border-gray-100 space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Invite New Member
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
              className="px-2 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </form>

        {/* Current Members List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Team Members ({members.length})
          </h3>
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};