import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { NavTab } from '../../types';

interface AccessRestrictedViewProps {
  attemptedTab: NavTab;
  tabLabel?: string;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({ attemptedTab, tabLabel }) => {
  const { currentUser, currentRole, users, setCurrentUserId, setActiveTab, allowedTabs } = usePortal();

  const handleSwitchToAdmin = () => {
    const adminUser = users.find(u => u.roleId === 'admin') || users[0];
    if (adminUser) {
      setCurrentUserId(adminUser.id);
    }
  };

  const handleGoToFirstAllowed = () => {
    if (allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0]);
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0c0f16] border border-[#1e2535] shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>403 Access Denied</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Restricted Module Access
          </h2>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Your current account <span className="text-white font-semibold">{currentUser.name}</span> with role <span className={`font-semibold ${currentRole.badgeColor}`}>{currentRole.name}</span> does not have permission to access the <strong>{tabLabel || attemptedTab}</strong> section.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1d2433] text-left text-xs space-y-1">
          <div className="flex justify-between text-[#64748b]">
            <span>Current Role:</span>
            <span className="text-slate-300 font-medium">{currentRole.name}</span>
          </div>
          <div className="flex justify-between text-[#64748b]">
            <span>Permission Override:</span>
            <span className={currentUser.useCustomPermissions ? 'text-amber-400 font-medium' : 'text-slate-400'}>
              {currentUser.useCustomPermissions ? 'Custom Overridden' : 'Standard Role Default'}
            </span>
          </div>
          <div className="flex justify-between text-[#64748b]">
            <span>Administrator:</span>
            <span className="text-emerald-400 font-medium">SAA (Management)</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleSwitchToAdmin}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Switch to Admin (SAA) to Unlock</span>
          </button>

          <button
            onClick={handleGoToFirstAllowed}
            className="w-full py-2.5 rounded-xl bg-[#141b27] hover:bg-[#1a2232] text-[#94a3b8] hover:text-white border border-[#20293b] font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Allowed Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};
