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
  Trash2
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { ShiftType } from '../../types';

export const StationView: React.FC = () => {
  const { stations, addStation, addMemberToStation, removeMemberFromStation } = usePortal();

  // Search & Shift filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('All');

  // Modals
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [selectedStationForMember, setSelectedStationForMember] = useState<string | null>(null);
  const [whatsappModalMember, setWhatsappModalMember] = useState<{ name: string; phone: string } | null>(null);

  // Form states
  const [newStationName, setNewStationName] = useState('');
  const [newStationShift, setNewStationShift] = useState<ShiftType>('Morning Shift');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+88017');

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStationForMember || !newMemberName.trim()) return;

    // Generate 2 initials
    const parts = newMemberName.trim().split(' ');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    addMemberToStation(selectedStationForMember, {
      name: newMemberName,
      initials,
      role: newMemberRole || 'Specialist',
      phoneWhatsapp: newMemberPhone
    });

    setNewMemberName('');
    setNewMemberRole('');
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Matching Screenshot 5 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Green file spreadsheet badge icon */}
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Shift Entries & Roster</h2>
            <p className="text-xs text-[#94a3b8]">Search and review station assignments in one place.</p>
          </div>
        </div>

        {/* Search bar with Ctrl+F badge */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search profile name..."
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
        </div>
      </div>

      {/* Roster Controls & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#1b212c] pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Morning Shift', 'Night Shift'].map(shift => (
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

      {/* Station Cards Grid Matching Screenshot 5 Exactly */}
      <div className="space-y-4">
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
                  {/* Category Color Dot */}
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {station.name}
                  </h3>
                  {/* Members count pill */}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#161c26] text-[#94a3b8] border border-[#232d3d]">
                    {station.members.length} members
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Shift Badge (Morning Shift in amber pill, Night Shift in purple/slate pill) */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      station.shift === 'Morning Shift'
                        ? 'bg-[#fef3c7] text-[#78350f]'
                        : 'bg-[#2e1065] text-[#c084fc] border border-[#581c87]'
                    }`}
                  >
                    {station.shift}
                  </span>

                  <button
                    onClick={() => setSelectedStationForMember(station.id)}
                    className="p-1 rounded text-[#64748b] hover:text-white hover:bg-[#161b24] transition-colors"
                    title="Add Member to this station"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtitle / Timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{station.updatedAt}</span>
              </div>

              {/* Members List Cards Matching Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                {station.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#11151e] border border-[#1e2634] hover:border-[#2b374a] transition-all group"
                  >
                    {/* Left: Initials + Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Member initial avatar */}
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

                    {/* Right: Green WhatsApp / Chat Button */}
                    <div className="flex items-center gap-1">
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
                        {/* WhatsApp / Chat SVG icon */}
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
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
                ))}

                {station.members.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-[#64748b] bg-[#0e1219]/60 rounded-xl border border-dashed border-[#1e2534]">
                    No members assigned to this station. Click "+" to assign team members.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Station Modal */}
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

      {/* Add Member to Station Modal */}
      {selectedStationForMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Assign Member to Station</h3>
              <button onClick={() => setSelectedStationForMember(null)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
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
                  onClick={() => setSelectedStationForMember(null)}
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

      {/* WhatsApp Quick Connect Dialog */}
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
