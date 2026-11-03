import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FolderPlus,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronsLeft,
  Route,
  Trophy,
} from 'lucide-react';

export type ViewKey =
  | 'overview'
  | 'projects'
  | 'create'
  | 'team'
  | 'schedule'
  | 'settings'
  | 'methodologies'
  | 'milestones';

interface SidebarProps {
  activeView: ViewKey;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (view: ViewKey) => void;
  onLogout: () => void;
  orgInitial: string;
  orgName: string;
  userName: string;
  userRole: string;
  canCreate: boolean;
}

const NAV_ITEMS: { key: ViewKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'create', label: 'Create Project', icon: FolderPlus },
  { key: 'team', label: 'Team Management', icon: Users },
  { key: 'schedule', label: 'Schedule Meeting', icon: Calendar },
  { key: 'methodologies', label: 'Methodologies', icon: Route },
  { key: 'milestones', label: 'Milestones & XP', icon: Trophy },
  { key: 'settings', label: 'User Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onLogout,
  orgInitial,
  orgName,
  userName,
  userRole,
  canCreate,
}) => {
  const items = NAV_ITEMS.filter((item) => item.key !== 'create' || canCreate);

  return (
    <aside
      className={`bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className={`border-b border-slate-800 flex items-center gap-3 ${collapsed ? 'px-3 py-4 justify-center' : 'px-5 py-4'}`}>
        <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow">
          {orgInitial}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">{orgName}</h1>
            <p className="text-[11px] text-slate-400 capitalize truncate">
              {userName} · {userRole}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? 'px-2.5' : 'px-3'}`}>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            title={collapsed ? label : undefined}
            className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
              collapsed ? 'justify-center p-2.5 w-full' : 'gap-3 px-3 py-2.5 w-full'
            } ${
              activeView === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={`py-4 border-t border-slate-800 space-y-1 ${collapsed ? 'px-2.5' : 'px-3'}`}>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={`flex items-center rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors w-full ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <ChevronsLeft
            size={18}
            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && 'Collapse'}
        </button>
        <button
          onClick={onLogout}
          title={collapsed ? 'Log Out' : undefined}
          className={`flex items-center rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors w-full ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={18} />
          {!collapsed && 'Log Out'}
        </button>
      </div>
    </aside>
  );
};
