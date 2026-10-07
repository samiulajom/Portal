import React from 'react';
import { 
  LayoutGrid, 
  HelpCircle, 
  Table, 
  Monitor, 
  AlertCircle, 
  Bookmark, 
  Store, 
  GitCompare, 
  Megaphone, 
  ChevronRight,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { NavTab } from '../../types';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    setIsAnnouncementsOpen, 
    setIsProfileOpen,
    queues,
    complains,
    issues
  } = usePortal();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <LayoutGrid className="w-[18px] h-[18px]" /> 
    },
    { 
      id: 'issues', 
      label: 'Issue Sheet', 
      icon: <HelpCircle className="w-[18px] h-[18px]" />,
      badge: issues.filter(i => i.status === 'open').length > 0 ? issues.filter(i => i.status === 'open').length : undefined
    },
    { 
      id: 'updates', 
      label: 'Update Sheet', 
      icon: <Table className="w-[18px] h-[18px]" /> 
    },
    { 
      id: 'stations', 
      label: 'Station', 
      icon: <Monitor className="w-[18px] h-[18px]" /> 
    },
    { 
      id: 'complains', 
      label: 'Complains', 
      icon: <AlertCircle className="w-[18px] h-[18px]" />,
      badge: complains.filter(c => c.status === 'Open' || c.status === 'Under Investigation').length > 0 
        ? complains.filter(c => c.status === 'Open' || c.status === 'Under Investigation').length 
        : undefined
    },
    { 
      id: 'queue', 
      label: 'Queue', 
      icon: <Bookmark className="w-[18px] h-[18px]" />,
      badge: queues.filter(q => q.status === 'Requested').length > 0 
        ? queues.filter(q => q.status === 'Requested').length 
        : undefined
    },
    {
      id: 'stores',
      label: 'Store Matrix',
      icon: <Store className="w-[18px] h-[18px]" />
    },
    {
      id: 'handover',
      label: 'Daily Handover',
      icon: <GitCompare className="w-[18px] h-[18px]" />
    }
  ];

  const handleNavClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0c10] border-r border-[#1c222b] flex flex-col justify-between transition-transform duration-200 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & Nav items */}
        <div className="flex flex-col">
          {/* Logo brand container */}
          <div className="h-18 px-5 flex items-center justify-between border-b border-[#1c222b]/50">
            <div className="flex items-center gap-2.5">
              {/* ScaleUp Signature Leaf SVG Icon */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none">
                  {/* Leaf petal 1: Vibrant Green */}
                  <path 
                    d="M18 4C11 8 8 16 10 24C12 32 20 33 26 27C31 22 30 13 25 7C22 3.5 19.5 3.5 18 4Z" 
                    fill="#22c55e" 
                  />
                  {/* Leaf petal 2: Lime / Gold Accent Leaf */}
                  <path 
                    d="M18 4C23 7 28 14 27 21C26 28 20 30 16 26C11 21 13 12 17 6C17.5 4.5 17.8 4 18 4Z" 
                    fill="#eab308" 
                    opacity="0.9"
                  />
                  {/* Inner vein */}
                  <path 
                    d="M18 6C17.5 12 19 18 22 25" 
                    stroke="#0a0c10" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans uppercase">
                SCALEUP
              </span>
            </div>

            {/* Mobile close */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'border border-[#d97706]/70 bg-[#16140e] text-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                      : 'border border-transparent text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#12161f]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#f59e0b]' : 'text-[#64748b]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#d97706]/30 text-amber-200' : 'bg-red-950 text-red-300 border border-red-800/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Announcements & User Profile */}
        <div className="p-3 border-t border-[#1c222b] space-y-2.5">
          {/* Announcements Button */}
          <button
            onClick={() => setIsAnnouncementsOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg border border-[#eab308]/40 bg-[#1e1a0b] text-[#fbbf24] hover:bg-[#28220f] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-4 h-4 text-[#fbbf24]" />
              <span className="font-semibold">Announcements</span>
            </div>
            <span className="text-[10px] font-mono text-[#fbbf24]/80 px-1 py-0.5 rounded bg-amber-500/10">
              v1.0.1
            </span>
          </button>

          {/* User Profile Card */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[#11141c] hover:bg-[#161a24] border border-[#1e2531] transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar with active indicator */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {user.avatarText}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0c10] ${
                  user.isClockedIn ? 'bg-emerald-500' : 'bg-neutral-500'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#64748b] truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748b] group-hover:text-white transition-colors shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
