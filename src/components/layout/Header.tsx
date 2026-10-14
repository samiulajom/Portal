import React, { useState, useRef, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Search, 
  Menu, 
  Clock, 
  CheckCircle2, 
  Bell, 
  Shield, 
  ChevronDown, 
  Sliders, 
  Key, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

interface HeaderProps {
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { 
    theme, 
    toggleTheme, 
    user, 
    users, 
    roles, 
    currentUser, 
    currentRole, 
    setCurrentUserId, 
    setActiveTab,
    canAccessTab,
    setIsCommandPaletteOpen,
    setIsAnnouncementsOpen
  } = usePortal();

  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserSwitcherOpen(false);
      }
    };
    if (isUserSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserSwitcherOpen]);

  return (
    <header className="h-18 px-6 lg:px-8 bg-[#090b0e] border-b border-[#1c222b] flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Hamburger (mobile) + Dynamic Brand / User Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#151922]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">
                SAA (Dashboard)
              </h1>
              {/* Role pill badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${currentRole.badgeColor} ${currentRole.badgeBg}`}>
                {currentRole.name}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] flex items-center gap-1.5 mt-0.5">
              <span>{currentUser.name}</span>
              <span className="text-[#475569]">•</span>
              <span className="text-[#64748b]">{currentUser.department}</span>
              {currentUser.useCustomPermissions && (
                <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1 rounded">
                  Custom Access
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#94a3b8] bg-[#12161f] border border-[#1e2531] rounded-lg hover:text-white hover:border-[#334155] transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1c222b] text-[#94a3b8] rounded border border-[#2b3544]">
            Ctrl K
          </kbd>
        </button>

        {/* ACTIVE ROLE / USER SWITCHER DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsUserSwitcherOpen(prev => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111622] hover:bg-[#161d2d] border border-[#1f283a] text-xs font-medium text-white transition-all shadow-xs cursor-pointer active:scale-98"
            title="Switch portal identity / test as other roles"
          >
            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
              {currentUser.avatarText}
            </div>
            <span className="hidden md:inline font-semibold text-slate-200 max-w-[110px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform ${isUserSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Switcher Dropdown Menu */}
          {isUserSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0c0f16] border border-[#20293b] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#1b2332] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch Active User / Role</span>
                </span>
                <span className="text-[10px] text-[#64748b] font-mono">
                  {users.length} profiles
                </span>
              </div>

              <div className="py-1 max-h-[320px] overflow-y-auto space-y-1">
                {users.map(u => {
                  const roleDef = roles.find(r => r.id === u.roleId) || roles[0];
                  const isSelected = u.id === currentUser.id;

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserId(u.id);
                        setIsUserSwitcherOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#161f30] border border-amber-500/40 text-white shadow-xs' 
                          : 'hover:bg-[#121622] text-[#cbd5e1] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-700 font-bold text-xs flex items-center justify-center text-white shrink-0">
                          {u.avatarText}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${roleDef.badgeColor} ${roleDef.badgeBg}`}>
                              {roleDef.name}
                            </span>
                            {u.useCustomPermissions && (
                              <span className="text-[9px] text-amber-400 font-mono">
                                • Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-[#64748b] hover:text-white shrink-0">
                          Switch
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {canAccessTab('access') && (
                <div className="pt-2 mt-1 border-t border-[#1b2332]">
                  <button
                    onClick={() => {
                      setActiveTab('access');
                      setIsUserSwitcherOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#141b27] hover:bg-[#1c2638] text-amber-400 hover:text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Access & Role Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shift Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111620] border border-[#1e2738] text-xs">
          <span className={`w-2 h-2 rounded-full ${user.isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
          <span className="text-[#94a3b8]">{user.shift}</span>
          <span className="text-[#64748b] font-mono">({user.clockInTime})</span>
        </div>

        {/* Announcements trigger bell */}
        <button
          onClick={() => setIsAnnouncementsOpen(true)}
          className="relative p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#151922] transition-colors border border-transparent hover:border-[#1e2531] cursor-pointer"
          title="Announcements"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white bg-[#11141c] hover:bg-[#171b26] border border-[#1e2531] transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-neutral-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
};
