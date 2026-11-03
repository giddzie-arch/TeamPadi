import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Timer, Trash2 } from 'lucide-react';
import api from '../api/client';
import type { Project, Task } from '../types';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdated: () => void;
}

interface Member {
  id: number;
  name: string;
  email: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onProjectUpdated,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Task[]>(`/projects/${project.id}/tasks`);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    api.get<Member[]>('/organization/members').then((res) => setMembers(res.data)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setSaving(true);
    try {
      const { data } = await api.post<Task>(`/projects/${project.id}/tasks`, {
        title,
        priority,
        status: 'todo',
        due_date: dueDate || null,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      });
      setTasks((prev) => [data, ...prev]);
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setAssignedTo('');
      onProjectUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: Task['status']) => {
    try {
      const { data } = await api.patch<Task>(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data : t)));
      onProjectUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleReassign = async (taskId: number, member: Member | null) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? {
      ...t,
      assigned_to: member?.id ?? null,
      assignee: member ?? null,
    } : t)));
    try {
      const { data } = await api.patch<Task>(`/tasks/${taskId}`, {
        assigned_to: member?.id ?? null,
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data : t)));
      onProjectUpdated();
    } catch (err: any) {
      setTasks(previous);
      setError(err.response?.data?.message || 'Failed to reassign task.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      onProjectUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const statusStyles: Record<Task['status'], string> = {
    done: 'bg-green-50 text-green-700 border-green-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    todo: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const priorityStyles: Record<Task['priority'], string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </button>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-100 text-blue-700">
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Tidy stat row */}
          <div className="flex items-center gap-5">
            {[
              { label: 'To Do', value: todo, color: 'text-gray-500' },
              { label: 'In Progress', value: inProgress, color: 'text-blue-600' },
              { label: 'Done', value: done, color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">{s.label}</p>
              </div>
            ))}
            <div className="w-24">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1">{pct}% complete</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">{error}</div>
      )}

      {/* Add task — clean two-row layout */}
      <form onSubmit={handleCreateTask} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            <span className="flex items-center gap-1.5">
              {saving ? <Timer size={14} /> : <Plus size={14} strokeWidth={2.5} />}
              {saving ? 'Adding' : 'Add Task'}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="px-2.5 py-2 border border-gray-300 rounded-md text-xs bg-white"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-2.5 py-2 border border-gray-300 rounded-md text-xs text-gray-600"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-2.5 py-2 border border-gray-300 rounded-md text-xs bg-white"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </form>

      {/* Task list — lined up */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Tasks ({tasks.length})
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No tasks yet — add the first one above.
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
            return (
              <div
                key={task.id}
                className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/60 transition-colors"
              >
                {/* Status */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                  className={`text-[11px] font-semibold rounded border px-2 py-1 ${statusStyles[task.status]}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                {/* Title */}
                <span
                  className={`flex-1 text-sm truncate ${
                    task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 font-medium'
                  }`}
                >
                  {task.title}
                </span>

                {/* Reassign */}
                <select
                  value={task.assigned_to ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const member = members.find((m) => m.id === id) ?? null;
                    handleReassign(task.id, member);
                  }}
                  title="Reassign task"
                  className="text-[11px] rounded-full border border-gray-200 px-2.5 py-1 bg-white text-gray-700 max-w-[140px] truncate hover:border-blue-400 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {task.assignee && (
                    <option value={task.assignee.id}>
                      {task.assignee.name}
                    </option>
                  )}
                  {members
                    .filter((m) => m.id !== task.assigned_to)
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                {/* Priority */}
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>

                {/* Due date */}
                {task.due_date && (
                  <span
                    className={`text-[11px] flex items-center gap-1 shrink-0 ${
                      overdue ? 'text-red-500 font-semibold' : 'text-gray-400'
                    }`}
                  >
                    <Timer size={11} />
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
