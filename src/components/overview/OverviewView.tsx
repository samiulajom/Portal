import React, { useMemo } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Users, 
  Store, 
  ArrowUpRight, 
  Plus, 
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const AVAILABLE_TEAMS = [
  'Shopify_Zen',
  'WP_Titans',
  'NextGen_WP',
  'WP Knight_Riders',
  'WIX_Spark',
  'Shopi_Day',
  'Webflow',
  'Square Space'
];

export const OverviewView: React.FC = () => {
  const { 
    issues, 
    queues, 
    updates, 
    stations, 
    stores, 
    handovers,
    setActiveTab,
    setIssueTeamFilter,
    user
  } = usePortal();

  // Metrics calculation
  const openIssuesCount = issues.filter(i => i.status === 'open').length;
  const inProgressIssuesCount = issues.filter(i => i.status === 'in progress').length;
  const resolvedIssuesCount = issues.filter(i => i.status === 'done').length;

  const totalMembers = stations.reduce((acc, st) => acc + st.members.length, 0);
  const requestedQueues = queues.filter(q => q.status === 'Requested').length;
  const givenQueues = queues.filter(q => q.status === 'Given').length;

  // TEAM-WISE STATUS & WIP MATRIX (Moved to Overview as requested)
  // "Team-Wise Status & WIP Matrix (টিমভিত্তিক ইস্যু সামারি) aita ami issue sheet er aikhne na deikha overview er aitay dekhte chai"
  const teamBreakdown = useMemo(() => {
    const allTeams = Array.from(new Set([...AVAILABLE_TEAMS, ...issues.map(i => i.team)]));
    return allTeams.map(teamName => {
      const teamIssues = issues.filter(i => i.team === teamName);
      const open = teamIssues.filter(i => i.status === 'open').length;
      const wip = teamIssues.filter(i => i.status === 'in progress').length;
      const done = teamIssues.filter(i => i.status === 'done').length;
      const total = teamIssues.length;
      return {
        team: teamName,
        open,
        wip,
        done,
        total
      };
    });
  }, [issues]);

  const handleTeamClick = (teamName: string) => {
    setIssueTeamFilter(teamName);
    setActiveTab('issues');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 3 Primary Metric Cards Matching Screenshot 2 Exactly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Card 1: Issue Open */}
        <div 
          onClick={() => {
            setIssueTeamFilter('All');
            setActiveTab('issues');
          }}
          className="bg-[#0f1217] hover:bg-[#13171e] border border-[#1b212c] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-red-900/40 group shadow-sm"
        >
          <span className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono tabular-nums group-hover:scale-105 transition-transform">
            {openIssuesCount}
          </span>
          <span className="text-sm font-semibold text-[#ef4444] tracking-wide">
            Issue Open
          </span>
        </div>

        {/* Card 2: Work In Progress */}
        <div 
          onClick={() => {
            setIssueTeamFilter('All');
            setActiveTab('issues');
          }}
          className="bg-[#0f1217] hover:bg-[#13171e] border border-[#1b212c] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-amber-900/40 group shadow-sm"
        >
          <span className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono tabular-nums group-hover:scale-105 transition-transform">
            {inProgressIssuesCount}
          </span>
          <span className="text-sm font-semibold text-[#eab308] tracking-wide">
            Work In Progress
          </span>
        </div>

        {/* Card 3: Resolved */}
        <div 
          onClick={() => {
            setIssueTeamFilter('All');
            setActiveTab('issues');
          }}
          className="bg-[#0f1217] hover:bg-[#13171e] border border-[#1b212c] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-900/40 group shadow-sm"
        >
          <span className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono tabular-nums group-hover:scale-105 transition-transform">
            {resolvedIssuesCount}
          </span>
          <span className="text-sm font-semibold text-[#22c55e] tracking-wide">
            Resolved
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TEAM-WISE STATUS & WIP MATRIX (টিমভিত্তিক ইস্যু সামারি)                     */}
      {/* ========================================================================= */}
      <div className="bg-[#0c0f14] border border-[#1b212c] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b212c] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Team-Wise Status & WIP Matrix (টিমভিত্তিক ইস্যু সামারি)
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Real-time breakdown of Open, Work In Progress (WIP), and Done issues by agency development teams.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIssueTeamFilter('All');
              setActiveTab('issues');
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open in Issue Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Teams Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {teamBreakdown.map(item => {
            const hasActivity = item.total > 0;
            const completionPercent = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;

            return (
              <div
                key={item.team}
                onClick={() => handleTeamClick(item.team)}
                className="p-4 rounded-xl bg-[#11141c] hover:bg-[#161b24] border border-[#1d2535] hover:border-amber-500/50 cursor-pointer transition-all space-y-3 group shadow-xs"
                title={`Click to view all issues assigned to ${item.team}`}
              >
                {/* Team Name & Total Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-semibold text-white text-xs truncate group-hover:text-amber-300 transition-colors">
                      {item.team}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18202c] text-neutral-300 border border-[#273347]">
                    {item.total} {item.total === 1 ? 'issue' : 'issues'}
                  </span>
                </div>

                {/* 3 Status Counters: Open, WIP, Done */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                  {/* Open */}
                  <div className="p-1.5 rounded-lg bg-[#181316] border border-red-950/60">
                    <span className="text-[10px] text-red-400 block font-sans">Open</span>
                    <span className={`text-xs font-bold ${item.open > 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                      {item.open}
                    </span>
                  </div>

                  {/* WIP */}
                  <div className="p-1.5 rounded-lg bg-[#1a1711] border border-amber-950/60">
                    <span className="text-[10px] text-amber-400 block font-sans">WIP</span>
                    <span className={`text-xs font-bold ${item.wip > 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                      {item.wip}
                    </span>
                  </div>

                  {/* Done */}
                  <div className="p-1.5 rounded-lg bg-[#111a14] border border-emerald-950/60">
                    <span className="text-[10px] text-emerald-400 block font-sans">Done</span>
                    <span className={`text-xs font-bold ${item.done > 0 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {item.done}
                    </span>
                  </div>
                </div>

                {/* Completion Progress Bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                    <span>Resolution rate</span>
                    <span className="font-mono text-neutral-300">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1c2331] overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${(item.done / (item.total || 1)) * 100}%` }}
                    />
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300" 
                      style={{ width: `${(item.wip / (item.total || 1)) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500 h-full transition-all duration-300" 
                      style={{ width: `${(item.open / (item.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-[#64748b] group-hover:text-amber-400 flex items-center justify-end gap-1 pt-1">
                  <span>Filter this team</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Summary */}
        <div className="lg:col-span-2 bg-[#0c0f14] border border-[#1b212c] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1b212c] pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Daily Operational Velocity</h3>
              <p className="text-xs text-[#94a3b8]">Real-time agency workflow and handover tracking</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#161a22] text-[#94a3b8] border border-[#232b38]">
              Shift: {user.shift}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1e2531]">
              <span className="text-xs text-[#94a3b8] block mb-1">Queue Requests</span>
              <span className="text-xl font-bold text-white font-mono">{requestedQueues}</span>
              <span className="text-[11px] text-amber-400 block mt-0.5">Pending assist</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1e2531]">
              <span className="text-xs text-[#94a3b8] block mb-1">Queue Given</span>
              <span className="text-xl font-bold text-white font-mono">{givenQueues}</span>
              <span className="text-[11px] text-emerald-400 block mt-0.5">Assigned & active</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1e2531]">
              <span className="text-xs text-[#94a3b8] block mb-1">Active Stations</span>
              <span className="text-xl font-bold text-white font-mono">{stations.length}</span>
              <span className="text-[11px] text-cyan-400 block mt-0.5">{totalMembers} Members rostered</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1e2531]">
              <span className="text-xs text-[#94a3b8] block mb-1">Fiverr Stores</span>
              <span className="text-xl font-bold text-white font-mono">{stores.length}</span>
              <span className="text-[11px] text-purple-400 block mt-0.5">Profiles active</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Quick Navigation & Actions</h4>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab('queue')}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#151922] hover:bg-[#1c2230] border border-[#232b38] text-white flex items-center gap-2 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Submit Queue Request</span>
              </button>
              <button
                onClick={() => setActiveTab('updates')}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#151922] hover:bg-[#1c2230] border border-[#232b38] text-white flex items-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log Update Entry</span>
              </button>
              <button
                onClick={() => setActiveTab('stations')}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#151922] hover:bg-[#1c2230] border border-[#232b38] text-white flex items-center gap-2 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Check Station Roster</span>
              </button>
              <button
                onClick={() => setActiveTab('handover')}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#151922] hover:bg-[#1c2230] border border-[#232b38] text-white flex items-center gap-2 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Shift Handover Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Shift Roster Snapshot */}
        <div className="bg-[#0c0f14] border border-[#1b212c] rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1b212c] pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Station Roster Spotlight
              </h3>
              <button 
                onClick={() => setActiveTab('stations')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {stations.slice(1, 4).map(st => (
                <div key={st.id} className="p-3 rounded-lg bg-[#11141c] border border-[#1a212c] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200">{st.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {st.shift}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {st.members.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#181d26] text-[11px] text-[#cbd5e1] border border-[#283244]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {m.name.split(' ')[0]}
                      </span>
                    ))}
                    {st.members.length === 0 && (
                      <span className="text-xs text-[#64748b]">No active members</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Handover note snippet */}
          <div className="pt-4 border-t border-[#1b212c]">
            <div className="p-3 rounded-lg bg-[#1a160d] border border-amber-900/30">
              <span className="text-[11px] font-semibold text-amber-300 block mb-1">
                Latest Shift Note:
              </span>
              <p className="text-xs text-neutral-300 line-clamp-2">
                {handovers[0]?.notes || 'All shifts clear and operational.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates Table Preview */}
      <div className="bg-[#0c0f14] border border-[#1b212c] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Communication & Update Entries</h3>
            <p className="text-xs text-[#94a3b8]">Live messages logged across agency client profiles</p>
          </div>
          <button
            onClick={() => setActiveTab('updates')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            <span>Open Update Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b212c] text-[#64748b] font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Profile</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Update By</th>
                <th className="py-2.5 px-3">Operation Comment</th>
                <th className="py-2.5 px-3">TL Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b212c]/60 text-neutral-300">
              {updates.slice(0, 4).map(u => (
                <tr key={u.id} className="hover:bg-[#11141c]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-neutral-400">{u.date}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-amber-300">{u.profile}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{u.clientName}</td>
                  <td className="py-2.5 px-3 text-[#94a3b8]">{u.updateBy}</td>
                  <td className="py-2.5 px-3">
                    {u.commentOperation ? (
                      <span className="px-2.5 py-0.5 rounded bg-[#1e2430] text-[#93c5fd] text-[11px]">
                        {u.commentOperation}
                      </span>
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {u.tlCheck ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[#94a3b8]">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
