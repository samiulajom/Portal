import React from 'react';
import { User, X, Clock, Shield, CheckCircle2, RotateCcw, Laptop } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const UserProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, user, toggleClockIn, resetAllData } = usePortal();

  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-md p-6 space-y-5 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202937] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-base font-bold text-white shadow-md">
              {user.avatarText}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user.name}</h3>
              <p className="text-xs text-[#94a3b8]">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-1 rounded-lg text-[#94a3b8] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Attendance Card */}
        <div className="p-4 rounded-xl bg-[#121620] border border-[#1e2533] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#94a3b8]">Shift Status</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${
              user.isClockedIn 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-neutral-800 text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.isClockedIn ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              {user.isClockedIn ? 'Clocked In (Active)' : 'Clocked Out'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1d2433]">
            <div>
              <span className="text-[#64748b] block text-[11px]">Shift</span>
              <span className="text-white font-medium">{user.shift}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[11px]">Clock-In Time</span>
              <span className="text-white font-mono">{user.clockInTime}</span>
            </div>
          </div>

          <button
            onClick={toggleClockIn}
            className={`w-full py-2 rounded-lg font-semibold transition-colors mt-2 ${
              user.isClockedIn
                ? 'bg-amber-600 hover:bg-amber-500 text-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {user.isClockedIn ? 'Take Shift Break / Clock Out' : 'Clock In Now'}
          </button>
        </div>

        {/* Assigned Responsibilities */}
        <div className="space-y-2 text-xs">
          <span className="text-[#94a3b8] font-semibold block">Primary Stations & Stores</span>
          <div className="p-3 rounded-lg bg-[#121620] border border-[#1e2533] space-y-1.5 text-neutral-300">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Department:</span>
              <span className="text-white font-medium">Shopify Dev</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Primary Account:</span>
              <span className="text-amber-300 font-mono">ecom_store3_Fiverr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Sales Partner:</span>
              <span className="text-white">Shishir chowdhory</span>
            </div>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-2 border-t border-[#202937] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              resetAllData();
              setIsProfileOpen(false);
            }}
            className="text-[#64748b] hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setIsProfileOpen(false)}
            className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
