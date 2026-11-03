import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type { Project, User, Organization } from '../types/index';
import { TeamModal } from './TeamModal';
import { Sidebar, type ViewKey } from './Sidebar';
import { CreateProjectModal } from './CreateProjectModal';
import { ChatDropdown } from './ChatDropdown';
import { ScheduleMeeting } from './ScheduleMeeting';
import { UserSettings } from './UserSettings';
import { ProjectsView, type ProjectFilter } from './ProjectsView';
import { ProjectDetail } from './ProjectDetail';
import { Methodologies } from './Methodologies';
import { Milestones } from './Milestones';
import { SummaryCards, StatusDonut, PriorityBars } from './ActivityCharts';
import { levelFromXp, xpFromStats, levelTitle } from '../lib/gamification';
import { Plus, Trophy } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const VIEW_TITLES: Record<ViewKey, string> = {
  overview: 'Dashboard Overview',
  projects: 'Projects',
  create: 'Create Project',
  team: 'Team Management',
  schedule: 'Schedule Meeting',
  settings: 'User Settings',
  methodologies: 'Methodologies',
  milestones: 'Milestones & XP',
};

const COLLAPSE_KEY = 'sidebar_collapsed';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSE_KEY) === '1');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, projectsRes] = await Promise.all([
        api.get<User>('/user/profile'),
        api.get('/projects'),
      ]);

      setCurrentUser(profileRes.data);
      if (profileRes.data.organizations && profileRes.data.organizations.length > 0) {
        setCurrentOrg(profileRes.data.organizations[0]);
      }

      const projectsData = projectsRes.data.data ? projectsRes.data.data : projectsRes.data;
      setProjects(projectsData);

      // Keep an open project in sync with fresh data
      setOpenProject((prevOpen) => {
        if (!prevOpen) return prevOpen;
        return projectsData.find((p: Project) => p.id === prevOpen.id) ?? prevOpen;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load workspace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
      if (openProject?.id === id) {
        setOpenProject(null);
        setActiveView('projects');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Proceed even if backend token is already invalid
    } finally {
      localStorage.removeItem('auth_token');
      onLogout();
    }
  };

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1');
      return !prev;
    });
  };

  const userRole = currentOrg?.pivot?.role || 'member';
  const isLeadOrOwner = userRole === 'owner' || userRole === 'admin';

  const handleNavigate = (view: ViewKey) => {
    switch (view) {
      case 'create':
        if (isLeadOrOwner) setIsCreateModalOpen(true);
        break;
      case 'team':
        setIsTeamModalOpen(true);
        break;
      default:
        if (view !== 'projects') setOpenProject(null);
        setActiveView(view);
    }
  };

  const handleCardClick = (filter: ProjectFilter) => {
    setProjectFilter(filter);
    setOpenProject(null);
    setActiveView('projects');
  };

  const handleOpenProject = (p: Project) => {
    setOpenProject(p);
    setActiveView('projects');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Side Menu */}
      <Sidebar
        activeView={openProject ? 'projects' : activeView}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        orgInitial={currentOrg ? currentOrg.name.charAt(0).toUpperCase() : 'P'}
        orgName={currentOrg ? currentOrg.name : 'Project Management'}
        userName={currentUser?.name ?? ''}
        userRole={userRole}
        canCreate={isLeadOrOwner}
      />

      {/* Main Column */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-200 ${
          collapsed ? 'ml-[68px]' : 'ml-64'
        }`}
      >
        {/* Top Workspace Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3 flex justify-between items-center">
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {openProject ? openProject.name : VIEW_TITLES[activeView]}
              </h1>
              <p className="text-xs text-gray-500 capitalize">
                Methodology: {currentOrg?.default_methodology || 'Kanban'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <ChatDropdown projects={projects} />

              {isLeadOrOwner && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  title="Create a new project"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  New
                </button>
              )}

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium tracking-wide uppercase ${
                  userRole === 'owner'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : userRole === 'admin'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {userRole}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Project detail (opened from any project list) */}
          {openProject && (
            <ProjectDetail
              project={openProject}
              onBack={() => {
                setOpenProject(null);
                setActiveView('projects');
              }}
              onProjectUpdated={loadDashboardData}
            />
          )}

          {/* Projects listing (reached via summary cards or side menu) */}
          {!openProject && activeView === 'projects' && (
            <ProjectsView
              projects={projects}
              loading={loading}
              filter={projectFilter}
              onFilterChange={setProjectFilter}
              onOpenProject={handleOpenProject}
              onDeleteProject={handleDeleteProject}
              canManage={isLeadOrOwner}
            />
          )}

          {!openProject && activeView === 'overview' && (
            <div className="space-y-6">
              {/* Summary cards — clickable, route to the Projects screen */}
              <SummaryCards projects={projects} onCardClick={handleCardClick} />

              {/* Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <StatusDonut projects={projects} />
                <PriorityBars projects={projects} />
              </div>

              {/* Milestone nudge */}
              <MilestoneNudge projects={projects} onOpen={() => handleNavigate('milestones')} />

              {/* Active projects list — members + deadlines */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
                  <button
                    onClick={() => handleCardClick('all')}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <ProjectsView
                  projects={projects.filter((p) => p.status !== 'completed')}
                  loading={loading}
                  filter="all"
                  showFilters={false}
                  onFilterChange={setProjectFilter}
                  onOpenProject={handleOpenProject}
                  onDeleteProject={handleDeleteProject}
                  canManage={isLeadOrOwner}
                />
              </section>
            </div>
          )}

          {!openProject && activeView === 'schedule' && (
            <ScheduleMeeting currentUser={currentUser} />
          )}
          {!openProject && activeView === 'settings' && (
            <UserSettings currentUser={currentUser} currentOrg={currentOrg} />
          )}
          {!openProject && activeView === 'methodologies' && (
            <Methodologies currentOrg={currentOrg} />
          )}
          {!openProject && activeView === 'milestones' && (
            <Milestones projects={projects} />
          )}
        </main>
      </div>

      {/* Team Management Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Create Project Modal (via sidebar / header + button) */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
};

/* Lightweight gamification hook shown on the overview to drive engagement */
const MilestoneNudge: React.FC<{ projects: Project[]; onOpen: () => void }> = ({ projects, onOpen }) => {
  const xp = xpFromStats(projects);
  const lvl = levelFromXp(xp);

  return (
    <button
      onClick={onOpen}
      className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            Level {lvl.level} · {levelTitle(lvl.level)}
          </p>
          <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lvl.pct}%` }} />
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{xp.toLocaleString()} XP</p>
        <p className="text-[11px] text-slate-400">
          {lvl.toNext} XP to Level {lvl.level + 1} →
        </p>
      </div>
    </button>
  );
};

export default Dashboard;
