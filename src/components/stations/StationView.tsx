import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  MessageCircle, 
  Plus, 
  Clock, 
  Users, 
  Phone, 
  X, 
  Check, 
  Calendar,
  UserPlus,
  Shield,
  Trash2,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { ShiftType } from '../../types';

export const StationView: React.FC = () => {
  const { 
    stations, 
    addStation, 
    addMemberToStation, 
    removeMemberFromStation,
    deleteStation,
    clearStationMembers,
    clearAllStationsMembers
  } = usePortal();

  // Search & Shift filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('All');

  // Modals
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [selectedStationForMember, setSelectedStationForMember] = useState<string | null>(null);
  const [whatsappModalMember, setWhatsappModalMember] = useState<{ name: string; phone: string } | null>(null);
  const [deleteConfirmStation, setDeleteConfirmStation] = useState<string | null>(null);
  const [clearConfirmStation, setClearConfirmStation] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  // Form states
  const [newStationName, setNewStationName] = useState('');
  const [newStationShift, setNewStationShift] = useState<ShiftType>('Morning Shift');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+88017');
  // Profile names as tag list
  const [newMemberProfileInput, setNewMemberProfileInput] = useState('');
  const [newMemberProfiles, setNewMemberProfiles] = useState<string[]>([]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter(st => {
      const matchesShift = selectedShift === 'All' || st.shift === selectedShift;
      if (!matchesShift) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchesStationName = st.name.toLowerCase().includes(q);
      const matchesMember = st.members.some(
        m => m.name.toLowerCase().includes(q) || (m.role && m.role.toLowerCase().includes(q))
      );

      return matchesStationName || matchesMember;
    });
  }, [stations, selectedShift, searchQuery]);

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;
    addStation(newStationName, newStationShift);
    setNewStationName('');
    setIsAddStationOpen(false);
  };

  // Add profile tag on Enter or comma
  const handleProfileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = newMemberProfileInput.trim().replace(/,$/, '');
      if (val && !newMemberProfiles.includes(val)) {
        setNewMemberProfiles(prev => [...prev, val]);
      }
      setNewMemberProfileInput('');
    } else if (e.key === 'Backspace' && !newMemberProfileInput && newMemberProfiles.length > 0) {
      setNewMemberProfiles(prev => prev.slice(0, -1));
    }
  };

  const removeProfileTag = (profile: string) => {
    setNewMemberProfiles(prev => prev.filter(p => p !== profile));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStationForMember || !newMemberName.trim()) return;

    // Flush pending profile input
    const finalProfiles = [...newMemberProfiles];
    if (newMemberProfileInput.trim()) {
      finalProfiles.push(newMemberProfileInput.trim());
    }

    // Generate 2 initials
    const parts = newMemberName.trim().split(' ');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    addMemberToStation(selectedStationForMember, {
      name: newMemberName,
      initials,
      role: newMemberRole || 'Specialist',
      phoneWhatsapp: newMemberPhone,
      profileNames: finalProfiles.length > 0 ? finalProfiles : undefined
    });

    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberPhone('+88017');
    setNewMemberProfileInput('');
    setNewMemberProfiles([]);
    setSelectedStationForMember(null);
  };

  const getStationDotColor = (name: string) => {
    if (name.toLowerCase().includes('graphics') || name.toLowerCase().includes('design')) return 'bg-cyan-400';
    if (name.toLowerCase().includes('custom') || name.toLowerCase().includes('shopify')) return 'bg-emerald-400';
    if (name.toLowerCase().includes('meta') || name.toLowerCase().includes('smm')) return 'bg-purple-400';
    if (name.toLowerCase().includes('seo')) return 'bg-sky-400';
    if (name.toLowerCase().includes('google')) return 'bg-amber-400';
    return 'bg-teal-400';
  };

  const selectedStationName = selectedStationForMember 
    ? stations.find(s => s.id === selectedStationForMember)?.name 
    : '';

  const totalMembers = stations.reduce((acc, st) => acc + st.members.length, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Shift Entries & Roster</h2>
            <p className="text-xs text-[#94a3b8]">
              Search, assign, and manage station rosters. <span className="text-emerald-400 font-mono">{totalMembers}</span> members rostered across <span className="text-amber-300 font-mono">{stations.length}</span> stations.
            </p>
          </div>
        </div>

        {/* Search bar + Add Station */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search station or member name..."
              className="w-full pl-9 pr-14 py-2 bg-[#10141d] border border-[#1e2736] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-[#64748b]"
            />
            <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#64748b] bg-[#171d27] border border-[#273244]">
              Ctrl F
            </span>
          </div>

          <button
            onClick={() => setIsAddStationOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Add Station</span>
          </button>

          {/* Global Clear All Rosters */}
          {totalMembers > 0 && (
            <button
              onClick={() => setClearAllConfirm(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-950/60 border border-amber-700/40 text-amber-300 hover:bg-amber-950 flex items-center gap-1.5 transition-colors shrink-0"
              title="Remove all members from ALL stations"
            >
              <UserX className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All Rosters</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster Controls & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#1b212c] pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Morning Shift', 'Evening Shift', 'Night Shift'].map(shift => (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedShift === shift
                  ? 'bg-[#1e1c12] text-amber-300 border border-amber-500/50'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[#94a3b8]">
          <span className="text-xs font-medium text-neutral-400">Station overview</span>
          <span className="font-mono px-2 py-0.5 rounded bg-[#131720] border border-[#1f2634] text-neutral-200">
            {filteredStations.length} stations
          </span>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="space-y-4">
        {filteredStations.length === 0 && (
          <div className="text-center py-16 text-[#64748b] text-sm">
            No stations found. Click "Add Station" to create one.
          </div>
        )}

        {filteredStations.map(station => {
          const dotColor = getStationDotColor(station.name);
          return (
            <div
              key={station.id}
              className="bg-[#0b0e14] border border-[#19202b] rounded-xl p-4 lg:p-5 space-y-4 transition-all hover:border-[#222c3c]"
            >
              {/* Station Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {station.name}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#161c26] text-[#94a3b8] border border-[#232d3d]">
                    {station.members.length} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Shift Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      station.shift === 'Morning Shift'
                        ? 'bg-[#fef3c7] text-[#78350f]'
                        : station.shift === 'Night Shift'
                        ? 'bg-[#2e1065] text-[#c084fc] border border-[#581c87]'
                        : 'bg-[#0c1a2e] text-[#60a5fa] border border-[#1e3a5f]'
                    }`}
                  >
                    {station.shift}
                  </span>

                  {/* Add Member */}
                  <button
                    onClick={() => setSelectedStationForMember(station.id)}
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-emerald-400 hover:bg-emerald-950/30 transition-colors"
                    title="Add Member to this station"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>

                  {/* Clear All Members */}
                  {station.members.length > 0 && (
                    <button
                      onClick={() => setClearConfirmStation(station.id)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-amber-400 hover:bg-amber-950/30 transition-colors"
                      title="Clear all members (daily reset)"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Station */}
                  <button
                    onClick={() => setDeleteConfirmStation(station.id)}
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete this station permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtitle / Timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{station.updatedAt}</span>
              </div>

              {/* Members List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                {station.members.map(member => (
                  <div
                    key={member.id}
                    className="flex flex-col p-2.5 rounded-xl bg-[#11151e] border border-[#1e2634] hover:border-[#2b374a] transition-all group"
                  >
                    {/* Top: Avatar + Name + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#1b2230] border border-[#2c374c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {member.name}
                          </span>
                          {member.role && (
                            <span className="text-[10px] text-[#64748b] block truncate">
                              {member.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            setWhatsappModalMember({
                              name: member.name,
                              phone: member.phoneWhatsapp || '+880170000000'
                            })
                          }
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                          title={`Open WhatsApp chat with ${member.name}`}
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.1 19.75 7.82 19L7.52 18.82L4.41 19.64L5.24 16.61L5.04 16.29C4.22 14.99 3.79 13.47 3.79 11.91C3.79 7.37 7.5 3.66 12.05 3.66C14.25 3.66 16.32 4.52 17.88 6.08C19.43 7.64 20.29 9.71 20.29 11.91C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.33C16.32 14.21 15.1 13.61 14.88 13.53C14.65 13.44 14.49 13.4 14.32 13.65C14.16 13.89 13.69 14.45 13.55 14.61C13.41 14.77 13.26 14.79 13.02 14.67C12.77 14.54 11.99 14.29 11.06 13.46C10.33 12.81 9.84 12.01 9.7 11.76C9.55 11.52 9.68 11.39 9.81 11.26C9.92 11.15 10.06 10.97 10.18 10.83C10.31 10.69 10.35 10.58 10.43 10.42C10.51 10.26 10.47 10.11 10.41 9.99C10.35 9.87 9.88 8.71 9.68 8.24C9.5 7.78 9.3 7.84 9.15 7.83C9.01 7.82 8.85 7.82 8.68 7.82C8.52 7.82 8.25 7.88 8.03 8.13C7.8 8.37 7.17 8.96 7.17 10.17C7.17 11.38 8.05 12.54 8.18 12.71C8.3 12.87 9.92 15.37 12.39 16.44C12.98 16.69 13.44 16.84 13.8 16.96C14.39 17.15 14.93 17.12 15.35 17.06C15.83 16.99 16.82 16.46 17.03 15.88C17.24 15.29 17.24 14.79 17.18 14.69C17.12 14.59 16.96 14.53 16.71 14.41L16.57 14.33Z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => removeMemberFromStation(station.id, member.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#64748b] hover:text-red-400 transition-opacity"
                          title="Remove member"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Profile tags row (shown below name if any) */}
                    {member.profileNames && member.profileNames.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[#1e2634]">
                        {member.profileNames.map((pn, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#1c2433] text-amber-300 border border-amber-800/40"
                          >
                            {pn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {station.members.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-[#64748b] bg-[#0e1219]/60 rounded-xl border border-dashed border-[#1e2534]">
                    No members assigned. Click <UserPlus className="w-3 h-3 inline" /> to assign team members.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ADD STATION MODAL ─────────────────────────────── */}
      {isAddStationOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Create New Department Station</h3>
              <button onClick={() => setIsAddStationOpen(false)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Station / Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shopify Liquid Development, QA Audit"
                  value={newStationName}
                  onChange={e => setNewStationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Assigned Shift</label>
                <select
                  value={newStationShift}
                  onChange={e => setNewStationShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                >
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setIsAddStationOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200"
                >
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD MEMBER MODAL ──────────────────────────────── */}
      {selectedStationForMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Assign Member to Station</h3>
                {selectedStationName && (
                  <p className="text-[11px] text-amber-300 mt-0.5 font-mono">{selectedStationName}</p>
                )}
              </div>
              <button onClick={() => { setSelectedStationForMember(null); setNewMemberProfiles([]); setNewMemberProfileInput(''); }} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              {/* Member Full Name */}
              <div>
                <label className="text-[#94a3b8] block mb-1">Member Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed, Rokibul Islam"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-[#94a3b8] block mb-1">Role / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Liquid Dev, Visual Designer"
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              {/* Profile Names — multi-tag input */}
              <div>
                <label className="text-[#94a3b8] block mb-1">
                  Profile Name(s)
                  <span className="text-[#64748b] ml-1">(press Enter or comma to add multiple)</span>
                </label>
                {/* Tag display + input */}
                <div className="flex flex-wrap gap-1.5 px-2.5 py-2 bg-[#161b24] border border-[#273244] rounded-lg min-h-[38px] focus-within:border-amber-500/60 transition-colors">
                  {newMemberProfiles.map((pn, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-700/40 text-amber-300 font-mono text-[10px]"
                    >
                      {pn}
                      <button
                        type="button"
                        onClick={() => removeProfileTag(pn)}
                        className="text-amber-400 hover:text-white"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newMemberProfileInput}
                    onChange={e => setNewMemberProfileInput(e.target.value)}
                    onKeyDown={handleProfileKeyDown}
                    placeholder={newMemberProfiles.length === 0 ? "e.g. ecom_store1_Fiverr, store2" : ""}
                    className="flex-1 min-w-[120px] bg-transparent text-white outline-none text-[11px] font-mono placeholder:text-[#374151]"
                  />
                </div>
                <p className="text-[10px] text-[#64748b] mt-1">Each profile tag = one Fiverr/store profile assigned to this member.</p>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-[#94a3b8] block mb-1">WhatsApp / Phone Number</label>
                <input
                  type="text"
                  placeholder="+8801712345678"
                  value={newMemberPhone}
                  onChange={e => setNewMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => { setSelectedStationForMember(null); setNewMemberProfiles([]); setNewMemberProfileInput(''); }}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CLEAR ALL STATIONS MEMBERS CONFIRM MODAL ──────── */}
      {clearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-amber-700/40 rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 mx-auto flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear ALL Station Rosters?</h3>
              <p className="text-xs text-[#94a3b8] mt-1.5">
                This will remove <strong className="text-amber-300">{totalMembers} members</strong> from all <strong className="text-amber-300">{stations.length} stations</strong> at once. Useful for shift-end or daily roster reset. Cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setClearAllConfirm(false)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllStationsMembers();
                  setClearAllConfirm(false);
                }}
                className="px-4 py-2 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              >
                Clear All Rosters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLEAR ALL MEMBERS CONFIRM MODAL ───────────────── */}
      {clearConfirmStation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-amber-800/40 rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 mx-auto flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear All Members?</h3>
              <p className="text-xs text-[#94a3b8] mt-1.5">
                This will remove all members from <strong className="text-amber-300">{stations.find(s => s.id === clearConfirmStation)?.name}</strong>. 
                Useful for daily roster reset. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setClearConfirmStation(null)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearStationMembers(clearConfirmStation);
                  setClearConfirmStation(null);
                }}
                className="px-4 py-2 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              >
                Clear All Members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE STATION CONFIRM MODAL ──────────────────── */}
      {deleteConfirmStation && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-red-800/40 rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Station?</h3>
              <p className="text-xs text-[#94a3b8] mt-1.5">
                <strong className="text-red-300">{stations.find(s => s.id === deleteConfirmStation)?.name}</strong> and all its {stations.find(s => s.id === deleteConfirmStation)?.members.length} members will be permanently deleted. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setDeleteConfirmStation(null)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStation(deleteConfirmStation);
                  setDeleteConfirmStation(null);
                }}
                className="px-4 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                Delete Station
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP QUICK CONNECT MODAL ──────────────────── */}
      {whatsappModalMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{whatsappModalMember.name}</h3>
              <p className="text-xs text-[#94a3b8] mt-1 font-mono">{whatsappModalMember.phone}</p>
            </div>

            <p className="text-xs text-neutral-400">
              Direct station connect. Launch WhatsApp to chat directly regarding orders or tickets.
            </p>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setWhatsappModalMember(null)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300"
              >
                Close
              </button>
              <a
                href={`https://wa.me/${whatsappModalMember.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
              >
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
