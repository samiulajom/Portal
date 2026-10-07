import React from 'react';
import { Moon, Sun, Search, Menu, Clock, CheckCircle2, Bell } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

interface HeaderProps {
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { 
    theme, 
    toggleTheme, 
    user, 
    setIsCommandPaletteOpen,
    setIsAnnouncementsOpen,
    announcements
  } = usePortal();

  return (
    <header className="h-18 px-6 lg:px-8 bg-[#090b0e] border-b border-[#1c222b] flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Hamburger (mobile) + Titles */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#151922]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">
            SAA (Dashboard)
          </h1>
          <p className="text-xs text-[#94a3b8]">
            {user.name}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#94a3b8] bg-[#12161f] border border-[#1e2531] rounded-lg hover:text-white hover:border-[#334155] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1c222b] text-[#94a3b8] rounded border border-[#2b3544]">
            Ctrl K
          </kbd>
        </button>

        {/* Shift Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111620] border border-[#1e2738] text-xs">
          <span className={`w-2 h-2 rounded-full ${user.isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
          <span className="text-[#94a3b8]">{user.shift}</span>
          <span className="text-[#64748b] font-mono">({user.clockInTime})</span>
        </div>

        {/* Announcements trigger bell */}
        <button
          onClick={() => setIsAnnouncementsOpen(true)}
          className="relative p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#151922] transition-colors border border-transparent hover:border-[#1e2531]"
          title="Announcements"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>

        {/* Dark / Light Mode Toggle Button (Matching Screenshot Icon & Container) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white bg-[#11141c] hover:bg-[#171b26] border border-[#1e2531] transition-colors"
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
