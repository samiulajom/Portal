import React, { useState, useMemo, useEffect } from 'react';
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
  AlertTriangle,
  CheckSquare,
  Square,
  UserCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { ShiftType, SavedMember } from '../../types';

export const StationView: React.FC = () => {
  const { 
    stations, 
    addStation, 
    setStationDutyContact,
    addMemberToStation, 
    addMultipleMembersToStation,
    removeMemberFromStation,
    deleteStation,
    clearStationMembers,
    clearStationsMembers,
    clearAllStationsMembers,
    savedMembers,
    addMemberToPool,
    removeMemberFromPool,
    updateMemberInPool,
    resetMemberPool
  } = usePortal();

  // Search & Shift filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('All');

  // Modals
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [selectedStationForMember, setSelectedStationForMember] = useState<string | null>(null);
  const [whatsappModalMember, setWhatsappModalMember] = useState<{ name: string; phone: string; stationName?: string } | null>(null);
  const [deleteConfirmStation, setDeleteConfirmStation] = useState<string | null>(null);
  const [clearConfirmStation, setClearConfirmStation] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  // Team-wise removal modal state
  const [isClearByTeamOpen, setIsClearByTeamOpen] = useState(false);
  const [selectedTeamsToClear, setSelectedTeamsToClear] = useState<string[]>([]);
  const [teamModalFilterShift, setTeamModalFilterShift] = useState<string>('All');
  const [teamModalSearch, setTeamModalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Member Modal tabs & selection state
  const [addMemberTab, setAddMemberTab] = useState<'select' | 'create'>('select');
  const [memberSelectSearch, setMemberSelectSearch] = useState('');
  const [memberSelectFilter, setMemberSelectFilter] = useState<'all' | 'notInStation'>('all');
  const [selectedPoolMemberIds, setSelectedPoolMemberIds] = useState<string[]>([]);
  const [saveNewMemberToDirectory, setSaveNewMemberToDirectory] = useState(true);

  // Master Member Directory modal state
  const [isMemberDirectoryOpen, setIsMemberDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [isDirectoryAddOpen, setIsDirectoryAddOpen] = useState(false);
  const [newDirMemberName, setNewDirMemberName] = useState('');
  const [newDirMemberRole, setNewDirMemberRole] = useState('');
  const [newDirMemberPhone, setNewDirMemberPhone] = useState('+88017');
  const [newDirMemberDept, setNewDirMemberDept] = useState('');
  const [dirAssignStationMap, setDirAssignStationMap] = useState<Record<string, string>>({});
  const [memberToDeleteFromPool, setMemberToDeleteFromPool] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
    setToastMessage(`✓ "${newStationName}" স্টেশন তৈরি করা হয়েছে।`);
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

    addMemberToStation(
      selectedStationForMember,
      {
        name: newMemberName.trim(),
        initials,
        role: newMemberRole || 'Specialist',
        phoneWhatsapp: newMemberPhone,
        profileNames: finalProfiles.length > 0 ? finalProfiles : undefined
      },
      saveNewMemberToDirectory
    );

    setToastMessage(`✓ "${newMemberName}" কে "${selectedStationName}" স্টেশনে যোগ করা হয়েছে ${saveNewMemberToDirectory ? 'এবং মেম্বার তালিকায় সেভ রাখা হয়েছে।' : ''}`);
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

  const currentStationObj = useMemo(() => {
    return stations.find(s => s.id === selectedStationForMember);
  }, [stations, selectedStationForMember]);

  const totalMembers = stations.reduce((acc, st) => acc + st.members.length, 0);

  // Map each member name (lowercase) to the stations they currently sit in
  const memberCurrentStationsMap = useMemo(() => {
    const map = new Map<string, { stationId: string; stationName: string; shift: string }[]>();
    stations.forEach(st => {
      st.members.forEach(m => {
        const key = m.name.trim().toLowerCase();
        const existing = map.get(key) || [];
        existing.push({ stationId: st.id, stationName: st.name, shift: st.shift });
        map.set(key, existing);
      });
    });
    return map;
  }, [stations]);

  // Pool members for Select Tab in Add Member modal
  const poolMembersForSelect = useMemo(() => {
    const currentMemberNames = currentStationObj?.members.map(m => m.name.trim().toLowerCase()) || [];
    return savedMembers.filter(m => {
      const q = memberSelectSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        m.name.toLowerCase().includes(q) || 
        (m.role && m.role.toLowerCase().includes(q)) || 
        (m.phoneWhatsapp && m.phoneWhatsapp.includes(q)) ||
        (m.department && m.department.toLowerCase().includes(q));
      if (!matchesSearch) return false;

      const isAlreadyInStation = currentMemberNames.includes(m.name.trim().toLowerCase());
      if (memberSelectFilter === 'notInStation' && isAlreadyInStation) {
        return false;
      }
      return true;
    });
  }, [savedMembers, memberSelectSearch, memberSelectFilter, currentStationObj]);

  // 1-Click quick add from saved pool to current station
  const handleQuickAddSingleMember = (poolMember: SavedMember) => {
    if (!selectedStationForMember) return;
    const currentMemberNames = currentStationObj?.members.map(m => m.name.trim().toLowerCase()) || [];
    if (currentMemberNames.includes(poolMember.name.trim().toLowerCase())) {
      setToastMessage(`ℹ "${poolMember.name}" ইতিমধ্যে এই স্টেশনে যুক্ত আছেন।`);
      return;
    }
    addMemberToStation(selectedStationForMember, {
      name: poolMember.name,
      initials: poolMember.initials,
      role: poolMember.role || 'Specialist',
      phoneWhatsapp: poolMember.phoneWhatsapp,
      profileNames: poolMember.profileNames
    }, false);
    setToastMessage(`✓ "${poolMember.name}" সফলভাবে "${selectedStationName}" এ যোগ করা হয়েছে!`);
  };

  const handleToggleSelectPoolMember = (id: string) => {
    setSelectedPoolMemberIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAvailablePoolMembers = () => {
    const currentMemberNames = currentStationObj?.members.map(m => m.name.trim().toLowerCase()) || [];
    const availableIds = poolMembersForSelect
      .filter(m => !currentMemberNames.includes(m.name.trim().toLowerCase()))
      .map(m => m.id);

    const allAlreadySelected = availableIds.length > 0 && availableIds.every(id => selectedPoolMemberIds.includes(id));
    if (allAlreadySelected) {
      setSelectedPoolMemberIds(prev => prev.filter(id => !availableIds.includes(id)));
    } else {
      setSelectedPoolMemberIds(prev => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  const handleBatchAddSelectedMembers = () => {
    if (!selectedStationForMember || selectedPoolMemberIds.length === 0) return;
    const toAdd = savedMembers
      .filter(m => selectedPoolMemberIds.includes(m.id))
      .map(m => ({
        name: m.name,
        initials: m.initials,
        role: m.role || 'Specialist',
        phoneWhatsapp: m.phoneWhatsapp,
        profileNames: m.profileNames
      }));
    addMultipleMembersToStation(selectedStationForMember, toAdd);
    setToastMessage(`✓ ${toAdd.length} জন মেম্বারকে সফলভাবে "${selectedStationName}" এ যোগ করা হয়েছে!`);
    setSelectedPoolMemberIds([]);
    setSelectedStationForMember(null);
  };

  // Filtered members for Master Member Directory Modal
  const directoryFilteredMembers = useMemo(() => {
    if (!directorySearch.trim()) return savedMembers;
    const q = directorySearch.toLowerCase().trim();
    return savedMembers.filter(m => 
      m.name.toLowerCase().includes(q) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.phoneWhatsapp && m.phoneWhatsapp.includes(q)) ||
      (m.department && m.department.toLowerCase().includes(q))
    );
  }, [savedMembers, directorySearch]);

  const handleCreateNewPoolMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirMemberName.trim()) return;
    const parts = newDirMemberName.trim().split(' ');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    addMemberToPool({
      name: newDirMemberName.trim(),
      initials,
      role: newDirMemberRole.trim() || 'Specialist',
      phoneWhatsapp: newDirMemberPhone.trim() || undefined,
      department: newDirMemberDept.trim() || undefined
    });

    setToastMessage(`✓ "${newDirMemberName}" কে মেম্বার ডিরেক্টরিতে সফলভাবে যুক্ত করা হয়েছে!`);
    setNewDirMemberName('');
    setNewDirMemberRole('');
    setNewDirMemberPhone('+88017');
    setNewDirMemberDept('');
    setIsDirectoryAddOpen(false);
  };

  const handleAssignFromDirectory = (member: SavedMember, targetStationId: string) => {
    if (!targetStationId) return;
    const targetStation = stations.find(s => s.id === targetStationId);
    if (!targetStation) return;
    const currentMemberNames = targetStation.members.map(m => m.name.trim().toLowerCase());
    if (currentMemberNames.includes(member.name.trim().toLowerCase())) {
      setToastMessage(`ℹ "${member.name}" ইতিমধ্যে "${targetStation.name}" স্টেশনে যুক্ত আছেন।`);
      return;
    }
    addMemberToStation(targetStationId, {
      name: member.name,
      initials: member.initials,
      role: member.role || 'Specialist',
      phoneWhatsapp: member.phoneWhatsapp,
      profileNames: member.profileNames
    }, false);
    setToastMessage(`✓ "${member.name}" কে "${targetStation.name}" স্টেশনে অ্যাসাইন করা হয়েছে!`);
  };

  // Filtered stations for Clear By Team modal
  const teamModalStations = useMemo(() => {
    return stations.filter(st => {
      const matchesShift = teamModalFilterShift === 'All' || st.shift === teamModalFilterShift;
      if (!matchesShift) return false;
      if (!teamModalSearch.trim()) return true;
      const q = teamModalSearch.toLowerCase();
      return st.name.toLowerCase().includes(q) || st.shift.toLowerCase().includes(q);
    });
  }, [stations, teamModalFilterShift, teamModalSearch]);

  const stationsWithMembersCount = useMemo(() => {
    return stations.filter(st => st.members.length > 0).length;
  }, [stations]);

  const selectedTeamsMembersCount = useMemo(() => {
    return stations
      .filter(st => selectedTeamsToClear.includes(st.id))
      .reduce((acc, st) => acc + st.members.length, 0);
  }, [stations, selectedTeamsToClear]);

  const handleToggleSelectTeam = (id: string) => {
    setSelectedTeamsToClear(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllWithMembers = () => {
    const idsWithMembers = teamModalStations.filter(s => s.members.length > 0).map(s => s.id);
    const allAlreadySelected = idsWithMembers.length > 0 && idsWithMembers.every(id => selectedTeamsToClear.includes(id));
    if (allAlreadySelected) {
      setSelectedTeamsToClear(prev => prev.filter(id => !idsWithMembers.includes(id)));
    } else {
      setSelectedTeamsToClear(prev => Array.from(new Set([...prev, ...idsWithMembers])));
    }
  };

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

        {/* Search bar + Add Station + Team Clear + Clear All */}
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

          {/* Master Member Directory Button */}
          <button
            onClick={() => {
              setDirectorySearch('');
              setIsDirectoryAddOpen(false);
              setIsMemberDirectoryOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#131924] border border-[#232e42] text-white hover:bg-[#1b2333] hover:border-amber-500/40 flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            title="Open Master Member Pool / Directory (সকল সদস্য তালিকা)"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Member Directory</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] ml-0.5">
              {savedMembers.length}
            </span>
          </button>

          {/* Team-wise Member Removal Button */}
          {totalMembers > 0 && (
            <button
              onClick={() => {
                setSelectedTeamsToClear([]);
                setTeamModalSearch('');
                setTeamModalFilterShift('All');
                setIsClearByTeamOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              title="Remove members team-wise / select teams to clear (টিমভিত্তিক মেম্বার রিমুভ)"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Clear by Team</span>
            </button>
          )}

          {/* Global Clear All Rosters */}
          {totalMembers > 0 && (
            <button
              onClick={() => setClearAllConfirm(true)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-950/70 flex items-center gap-1.5 transition-colors shrink-0"
              title="Remove all members from ALL stations"
            >
              <UserX className="w-4 h-4 text-red-400" />
              <span className="hidden md:inline">Clear All</span>
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
          const dutyPerson = station.dutyContact || (station.members.length > 0 ? station.members[0] : (savedMembers.find(m => m.department?.toLowerCase().includes(station.name.toLowerCase())) || savedMembers[0]));
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

                  {/* Add Member (তালিকা থেকে বা নতুন) */}
                  <button
                    onClick={() => {
                      setSelectedStationForMember(station.id);
                      setAddMemberTab('select');
                      setMemberSelectSearch('');
                      setSelectedPoolMemberIds([]);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 shrink-0"
                    title="Assign or Select Member for this station (মেম্বার যুক্ত/সিলেক্ট করুন)"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Add Member</span>
                  </button>

                  {/* Clear Team Members (টিম মেম্বার রিমুভ) */}
                  {station.members.length > 0 && (
                    <button
                      onClick={() => setClearConfirmStation(station.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center gap-1.5 shrink-0"
                      title={`Remove all ${station.members.length} members from this team (টিম মেম্বার রিমুভ)`}
                    >
                      <UserX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Clear Team ({station.members.length})</span>
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
                  <div className="col-span-full py-4 px-4 bg-[#0e1219]/90 rounded-xl border border-dashed border-[#232d3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-[#94a3b8]">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span>এই স্টেশনের তথ্য/মেম্বার বর্তমানে উপলব্ধ নেই। জরুরি যোগাযোগ:</span>
                      <strong className="text-white font-medium">{dutyPerson?.name || 'Station Contact'}</strong>
                      {dutyPerson?.role && (
                        <span className="text-[#64748b]">({dutyPerson.role})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {dutyPerson?.phoneWhatsapp && (
                        <>
                          <a
                            href={`tel:${dutyPerson.phoneWhatsapp.replace(/[^0-9+]/g, '')}`}
                            className="font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-[#141d29] border border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                            title="Call directly"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{dutyPerson.phoneWhatsapp}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setWhatsappModalMember({
                              name: dutyPerson.name,
                              phone: dutyPerson.phoneWhatsapp || '+880170000000',
                              stationName: `${station.name} (${station.shift})`
                            })}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                            title={`Chat with ${dutyPerson.name} on WhatsApp`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStationForMember(station.id);
                          setAddMemberTab('select');
                          setMemberSelectSearch('');
                          setSelectedPoolMemberIds([]);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[#94a3b8] hover:text-white bg-[#161c26] border border-[#232d3d] flex items-center gap-1 transition-colors"
                        title="Select or add member"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+ Add Member</span>
                      </button>
                    </div>
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

      {/* ── ADD MEMBER MODAL (TABBED: QUICK SELECT OR CREATE NEW) ── */}
      {selectedStationForMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-xl p-5 space-y-4 max-h-[92vh] flex flex-col shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Assign Member to Station</span>
                </h3>
                {selectedStationName && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-300 font-semibold">{selectedStationName}</span>
                    {currentStationObj && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171e2b] text-[#94a3b8] border border-[#222c3d]">
                        {currentStationObj.shift}
                      </span>
                    )}
                    <span className="text-[10px] text-[#64748b]">
                      · currently {currentStationObj?.members.length || 0} members
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { 
                  setSelectedStationForMember(null); 
                  setNewMemberProfiles([]); 
                  setNewMemberProfileInput('');
                  setSelectedPoolMemberIds([]);
                }} 
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#1a2230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-[#202937] text-xs">
              <button
                type="button"
                onClick={() => setAddMemberTab('select')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  addMemberTab === 'select'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Select from Saved Members ({savedMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMemberTab('create')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  addMemberTab === 'create'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-[#94a3b8] hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Member (নতুন মেম্বার)</span>
              </button>
            </div>

            {/* ── TAB 1: SELECT FROM SAVED POOL ── */}
            {addMemberTab === 'select' && (
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748b]" />
                    <input
                      type="text"
                      value={memberSelectSearch}
                      onChange={e => setMemberSelectSearch(e.target.value)}
                      placeholder="Search member by name, role, phone..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#141923] border border-[#222a3a] rounded-lg text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMemberSelectFilter('all')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        memberSelectFilter === 'all'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-[#94a3b8] hover:text-white bg-[#141923] border border-[#1e2636]'
                      }`}
                    >
                      All ({savedMembers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberSelectFilter('notInStation')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        memberSelectFilter === 'notInStation'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-[#94a3b8] hover:text-white bg-[#141923] border border-[#1e2636]'
                      }`}
                    >
                      Not in this Station
                    </button>
                  </div>
                </div>

                {/* Counter & Batch Select All */}
                <div className="flex items-center justify-between text-[11px] px-1 text-[#94a3b8]">
                  <span>
                    Showing <strong className="text-white">{poolMembersForSelect.length}</strong> saved members
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllAvailablePoolMembers}
                    className="text-amber-400 hover:text-amber-300 font-medium underline"
                  >
                    {poolMembersForSelect.some(m => !currentStationObj?.members.some(cm => cm.name.trim().toLowerCase() === m.name.trim().toLowerCase())) &&
                     poolMembersForSelect
                       .filter(m => !currentStationObj?.members.some(cm => cm.name.trim().toLowerCase() === m.name.trim().toLowerCase()))
                       .every(m => selectedPoolMemberIds.includes(m.id))
                      ? 'Deselect All'
                      : 'Select All Available'}
                  </button>
                </div>

                {/* Members Pool List (Scrollable) */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[180px] max-h-[300px]">
                  {poolMembersForSelect.length === 0 ? (
                    <div className="text-center py-8 text-[#64748b] text-xs space-y-2">
                      <p>No matching saved members found.</p>
                      <button
                        type="button"
                        onClick={() => setAddMemberTab('create')}
                        className="text-amber-400 hover:text-amber-300 text-xs font-medium underline"
                      >
                        + Add them as a new member
                      </button>
                    </div>
                  ) : (
                    poolMembersForSelect.map(m => {
                      const currentMemberNames = currentStationObj?.members.map(cm => cm.name.trim().toLowerCase()) || [];
                      const isAlreadyInStation = currentMemberNames.includes(m.name.trim().toLowerCase());
                      const isSelected = selectedPoolMemberIds.includes(m.id);
                      
                      // Find which other stations this member is in
                      const assignedStations = memberCurrentStationsMap.get(m.name.trim().toLowerCase()) || [];
                      const otherStations = assignedStations.filter(as => as.stationId !== selectedStationForMember);

                      return (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isAlreadyInStation
                              ? 'bg-[#11141c]/60 border-[#19202c] opacity-70'
                              : isSelected
                              ? 'bg-amber-950/20 border-amber-500/50'
                              : 'bg-[#121620] border-[#1d2533] hover:border-[#2a364a]'
                          }`}
                        >
                          {/* Left: Checkbox + Avatar + Info */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              disabled={isAlreadyInStation}
                              checked={isSelected}
                              onChange={() => handleToggleSelectPoolMember(m.id)}
                              className="w-4 h-4 rounded border-[#273244] bg-[#161b24] text-amber-500 focus:ring-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                            />

                            <div className="w-8 h-8 rounded-full bg-[#1b2230] border border-[#2c374c] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {m.initials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white truncate block">
                                  {m.name}
                                </span>
                                {m.role && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171e2b] text-[#94a3b8] border border-[#222c3d] truncate">
                                    {m.role}
                                  </span>
                                )}
                              </div>

                              {/* Station badges (shows where they currently sit across the company) */}
                              <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[10px]">
                                {otherStations.length > 0 ? (
                                  <>
                                    <span className="text-[#64748b]">Also in:</span>
                                    {otherStations.map((os, idx) => (
                                      <span 
                                        key={idx} 
                                        className="px-1.5 py-0.2 rounded bg-[#161f2e] text-cyan-300 border border-cyan-800/40 font-mono text-[9px]"
                                      >
                                        {os.stationName}
                                      </span>
                                    ))}
                                  </>
                                ) : (
                                  <span className="text-[#64748b] italic">Not rostered in other stations</span>
                                )}

                                {m.phoneWhatsapp && (
                                  <span className="text-[#94a3b8] ml-1 font-mono hidden sm:inline">
                                    · {m.phoneWhatsapp}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          <div className="ml-2 shrink-0">
                            {isAlreadyInStation ? (
                              <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>In Station</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickAddSingleMember(m)}
                                className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                                title={`Add ${m.name} to this station`}
                              >
                                <Plus className="w-3 h-3 text-emerald-400" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer of Select Tab */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#202937]">
                  <p className="text-[11px] text-[#64748b]">
                    {selectedPoolMemberIds.length > 0 ? (
                      <span>
                        Selected: <strong className="text-amber-300 font-mono">{selectedPoolMemberIds.length}</strong> member(s)
                      </span>
                    ) : (
                      <span>Need a new person? Switch to the "Add New Member" tab.</span>
                    )}
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStationForMember(null);
                        setSelectedPoolMemberIds([]);
                      }}
                      className="px-3.5 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
                    >
                      Close
                    </button>

                    {selectedPoolMemberIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleBatchAddSelectedMembers}
                        className="px-4 py-2 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Add Selected ({selectedPoolMemberIds.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: CREATE BRAND NEW MEMBER ── */}
            {addMemberTab === 'create' && (
              <form onSubmit={handleAddMember} className="space-y-4 text-xs">
                {/* Member Full Name */}
                <div>
                  <label className="text-[#94a3b8] block mb-1">
                    Member Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed, Rokibul Islam"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-[#94a3b8] block mb-1">Role / Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Liquid Dev, Visual Designer, SEO Specialist"
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Profile Names — multi-tag input */}
                <div>
                  <label className="text-[#94a3b8] block mb-1">
                    Profile Name(s)
                    <span className="text-[#64748b] ml-1">(press Enter or comma to add multiple tags)</span>
                  </label>
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
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="text-[#94a3b8] block mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="text"
                    placeholder="+8801712345678"
                    value={newMemberPhone}
                    onChange={e => setNewMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Save to Member Pool Checkbox */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="saveToDirectoryCheckbox"
                    checked={saveNewMemberToDirectory}
                    onChange={e => setSaveNewMemberToDirectory(e.target.checked)}
                    className="w-4 h-4 rounded border-[#273244] bg-[#161b24] text-amber-500 focus:ring-0 cursor-pointer mt-0.5"
                  />
                  <label htmlFor="saveToDirectoryCheckbox" className="text-xs text-amber-200 cursor-pointer">
                    <strong className="block font-semibold">Save to Master Member Directory (ডিরেক্টরিতে সংরক্ষণ করুন)</strong>
                    <span className="text-[11px] text-[#94a3b8] block mt-0.5">
                      Check this to permanently save this member so they can be instantly selected for any other station later.
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#202937]">
                  <button
                    type="button"
                    onClick={() => { 
                      setSelectedStationForMember(null); 
                      setNewMemberProfiles([]); 
                      setNewMemberProfileInput(''); 
                    }}
                    className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member & Save</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MASTER MEMBER DIRECTORY MODAL (সকল সদস্য তালিকা) ── */}
      {isMemberDirectoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[92vh] flex flex-col shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Master Member Directory (সদস্য তালিকা)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    {savedMembers.length} Members
                  </span>
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  সকল সদস্যের কেন্দ্রীয় তালিকা — এক ক্লিকে যেকোনো স্টেশনে সদস্য যুক্ত করুন বা নতুন সদস্য তালিকাভুক্ত করুন।
                </p>
              </div>
              <button 
                onClick={() => { setIsMemberDirectoryOpen(false); setIsDirectoryAddOpen(false); }} 
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#1a2230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748b]" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={e => setDirectorySearch(e.target.value)}
                  placeholder="Search members by name, role, phone, or department..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#141923] border border-[#222a3a] rounded-lg text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDirectoryAddOpen(prev => !prev)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isDirectoryAddOpen ? 'Close Form' : 'Add Member to Pool'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore initial member directory roster?')) {
                      resetMemberPool();
                      setToastMessage('✓ মেম্বার তালিকা প্রাথমিক অবস্থায় রিসেট করা হয়েছে।');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-white bg-[#141923] border border-[#1e2636] flex items-center gap-1"
                  title="Reset to default members roster"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Inline Add Member to Directory Form */}
            {isDirectoryAddOpen && (
              <form onSubmit={handleCreateNewPoolMember} className="p-4 rounded-xl bg-[#141923] border border-[#273244] space-y-3 animate-fadeIn text-xs">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Member to Directory Pool (নতুন সদস্য তৈরি)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#94a3b8] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuzur Rahman"
                      value={newDirMemberName}
                      onChange={e => setNewDirMemberName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e1219] border border-[#222a3a] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#94a3b8] block mb-1">Role / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Shopify Specialist"
                      value={newDirMemberRole}
                      onChange={e => setNewDirMemberRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e1219] border border-[#222a3a] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#94a3b8] block mb-1">WhatsApp / Phone</label>
                    <input
                      type="text"
                      placeholder="+8801712345678"
                      value={newDirMemberPhone}
                      onChange={e => setNewDirMemberPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e1219] border border-[#222a3a] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#94a3b8] block mb-1">Default Department / Skill</label>
                    <input
                      type="text"
                      placeholder="e.g. Shopify Dev, Graphics"
                      value={newDirMemberDept}
                      onChange={e => setNewDirMemberDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e1219] border border-[#222a3a] rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#202937]">
                  <button
                    type="button"
                    onClick={() => setIsDirectoryAddOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2230] text-[#94a3b8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
                  >
                    Save to Directory
                  </button>
                </div>
              </form>
            )}

            {/* Members Directory List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[380px]">
              {directoryFilteredMembers.length === 0 ? (
                <div className="text-center py-10 text-[#64748b] text-xs">
                  No members found matching your search.
                </div>
              ) : (
                directoryFilteredMembers.map(m => {
                  const assignedStations = memberCurrentStationsMap.get(m.name.trim().toLowerCase()) || [];
                  const selectedAssignStation = dirAssignStationMap[m.id] || '';

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121620] border border-[#1e2636] hover:border-[#2a364a] transition-all"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-[#1b2230] border border-[#2c374c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {m.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate block">
                              {m.name}
                            </span>
                            {m.role && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171e2b] text-[#94a3b8] border border-[#222c3d] truncate">
                                {m.role}
                              </span>
                            )}
                          </div>

                          {/* Station assignments row */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                            {assignedStations.length > 0 ? (
                              <>
                                <span className="text-[#64748b]">Active in:</span>
                                {assignedStations.map((st, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded bg-[#17202d] text-emerald-300 border border-emerald-800/40 font-mono text-[9px]"
                                  >
                                    {st.stationName} ({st.shift.replace(' Shift', '')})
                                  </span>
                                ))}
                              </>
                            ) : (
                              <span className="text-[#64748b] italic">Not currently assigned to any station</span>
                            )}

                            {m.phoneWhatsapp && (
                              <span className="text-[#94a3b8] ml-1 font-mono">
                                · {m.phoneWhatsapp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Assign to Any Station & Delete */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2434]">
                        {/* Dropdown station selector */}
                        <select
                          value={selectedAssignStation}
                          onChange={e => setDirAssignStationMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                          className="px-2 py-1 bg-[#161b24] border border-[#273244] rounded-lg text-white text-[11px] max-w-[140px]"
                        >
                          <option value="">Assign to station...</option>
                          {stations.map(st => {
                            const isAlready = assignedStations.some(as => as.stationId === st.id);
                            return (
                              <option key={st.id} value={st.id}>
                                {isAlready ? '✓ ' : '+ '}{st.name} ({st.shift.replace(' Shift', '')})
                              </option>
                            );
                          })}
                        </select>

                        <button
                          type="button"
                          disabled={!selectedAssignStation}
                          onClick={() => {
                            handleAssignFromDirectory(m, selectedAssignStation);
                            setDirAssignStationMap(prev => ({ ...prev, [m.id]: '' }));
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Assign
                        </button>

                        {/* Remove from Directory */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`"${m.name}" কে মেম্বার ডিরেক্টরি থেকে মুছে ফেলতে চান?`)) {
                              removeMemberFromPool(m.id);
                              setToastMessage(`✓ "${m.name}" কে ডিরেক্টরি থেকে মুছে ফেলা হয়েছে।`);
                            }
                          }}
                          className="p-1 text-[#64748b] hover:text-red-400 rounded transition-colors"
                          title="Delete from master directory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#202937] text-[#94a3b8]">
              <span>
                Total <strong className="text-white font-mono">{savedMembers.length}</strong> master members in pool
              </span>
              <button
                type="button"
                onClick={() => setIsMemberDirectoryOpen(false)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
              >
                Close
              </button>
            </div>
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

      {/* ── CLEAR SINGLE TEAM MEMBERS CONFIRM MODAL ───────── */}
      {clearConfirmStation && (() => {
        const targetStation = stations.find(s => s.id === clearConfirmStation);
        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-[#0f131a] border border-amber-800/40 rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 mx-auto flex items-center justify-center">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear Team Members?</h3>
                <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">
                  Are you sure you want to remove all <strong className="text-amber-300">{targetStation?.members.length} members</strong> from <strong className="text-amber-300">{targetStation?.name}</strong> ({targetStation?.shift})?
                  <br /><span className="text-[11px] text-[#64748b] mt-1 block">টিমভিত্তিক সকল মেম্বার রস্টার থেকে মুছে ফেলা হবে। অন্যান্য টিমের রস্টার অপরিবর্তিত থাকবে।</span>
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
                    setToastMessage(`✓ "${targetStation?.name}" টিমের সকল মেম্বার সফলভাবে রিমুভ করা হয়েছে।`);
                    setClearConfirmStation(null);
                  }}
                  className="px-4 py-2 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Remove All Team Members</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── CLEAR BY TEAM MODAL (টিমভিত্তিক মেম্বার রিমুভ) ───────────────── */}
      {isClearByTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Remove Members by Team</h3>
                  <p className="text-[11px] text-[#94a3b8]">টিমভিত্তিক সকল মেম্বার রিমুভ করুন (Clear rosters per department/team)</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsClearByTeamOpen(false); setSelectedTeamsToClear([]); }}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#1a2230]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748b]" />
                  <input
                    type="text"
                    value={teamModalSearch}
                    onChange={e => setTeamModalSearch(e.target.value)}
                    placeholder="Search team / station name..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#141923] border border-[#232c3d] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-[#64748b]"
                  />
                </div>
                {/* Shift Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Morning Shift', 'Evening Shift', 'Night Shift'].map(shift => (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => setTeamModalFilterShift(shift)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                        teamModalFilterShift === shift
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-[#94a3b8] hover:text-white bg-[#141923] border border-[#1e2636]'
                      }`}
                    >
                      {shift === 'Morning Shift' ? 'Morning' : shift === 'Evening Shift' ? 'Evening' : shift === 'Night Shift' ? 'Night' : 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Bar */}
              <div className="flex items-center justify-between text-[11px] px-1 text-[#94a3b8]">
                <span>
                  Showing <strong className="text-white">{teamModalStations.length}</strong> teams ({teamModalStations.filter(s => s.members.length > 0).length} with active members)
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllWithMembers}
                  className="text-amber-400 hover:text-amber-300 font-medium underline"
                >
                  {teamModalStations.filter(s => s.members.length > 0).length > 0 && 
                   teamModalStations.filter(s => s.members.length > 0).every(s => selectedTeamsToClear.includes(s.id))
                    ? 'Deselect All'
                    : 'Select All with Members'}
                </button>
              </div>
            </div>

            {/* Teams List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[300px]">
              {teamModalStations.length === 0 ? (
                <div className="text-center py-8 text-[#64748b] text-xs">
                  No matching teams found.
                </div>
              ) : (
                teamModalStations.map(st => {
                  const isSelected = selectedTeamsToClear.includes(st.id);
                  const hasMembers = st.members.length > 0;
                  const dotColor = getStationDotColor(st.name);

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-amber-950/20 border-amber-500/50' 
                          : hasMembers 
                            ? 'bg-[#121620] border-[#1d2533] hover:border-[#2a364a]' 
                            : 'bg-[#0f131a] border-[#181f2b] opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!hasMembers}
                          checked={isSelected}
                          onChange={() => handleToggleSelectTeam(st.id)}
                          className="w-4 h-4 rounded border-[#273244] bg-[#161b24] text-amber-500 focus:ring-0 cursor-pointer disabled:opacity-40"
                        />
                        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate block">
                              {st.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171e2b] text-[#94a3b8] border border-[#222c3d]">
                              {st.shift.replace(' Shift', '')}
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono block ${hasMembers ? 'text-amber-400' : 'text-[#64748b]'}`}>
                            {st.members.length} member{st.members.length !== 1 ? 's' : ''} rostered
                          </span>
                        </div>
                      </label>

                      {/* 1-click single team remove button */}
                      {hasMembers && (
                        <button
                          type="button"
                          onClick={() => {
                            clearStationMembers(st.id);
                            setSelectedTeamsToClear(prev => prev.filter(id => id !== st.id));
                            setToastMessage(`✓ "${st.name}" টিমের সকল মেম্বার সফলভাবে রিমুভ করা হয়েছে।`);
                          }}
                          className="ml-2 px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1 shrink-0"
                          title={`Clear ${st.name} members now`}
                        >
                          <UserX className="w-3 h-3 text-amber-400" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#202937]">
              <div className="text-[11px] text-[#94a3b8]">
                {selectedTeamsToClear.length > 0 ? (
                  <span>
                    Selected: <strong className="text-amber-300 font-mono">{selectedTeamsToClear.length}</strong> team(s) · <strong className="text-amber-300 font-mono">{selectedTeamsMembersCount}</strong> member(s)
                  </span>
                ) : (
                  <span>Select teams to remove their members at once</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => { setIsClearByTeamOpen(false); setSelectedTeamsToClear([]); }}
                  className="px-3.5 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:bg-[#1f2633]"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={selectedTeamsToClear.length === 0 || selectedTeamsMembersCount === 0}
                  onClick={() => {
                    clearStationsMembers(selectedTeamsToClear);
                    setToastMessage(`✓ নির্বাচিত ${selectedTeamsToClear.length} টিমের (${selectedTeamsMembersCount} জন) মেম্বার রিমুভ করা হয়েছে।`);
                    setIsClearByTeamOpen(false);
                    setSelectedTeamsToClear([]);
                  }}
                  className="px-4 py-2 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Clear Selected ({selectedTeamsMembersCount})</span>
                </button>
              </div>
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
      {whatsappModalMember && (() => {
        const cleanPhone = whatsappModalMember.phone.replace(/[^0-9]/g, '');
        const messageText = whatsappModalMember.stationName
          ? `Hello ${whatsappModalMember.name}, I am contacting you regarding station: ${whatsappModalMember.stationName}.`
          : `Hello ${whatsappModalMember.name}, contacting you regarding station support.`;
        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-sm p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{whatsappModalMember.name}</h3>
                <p className="text-xs text-[#94a3b8] mt-1 font-mono">{whatsappModalMember.phone}</p>
                {whatsappModalMember.stationName && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-[#161c28] text-amber-300 border border-[#243044]">
                    Station: {whatsappModalMember.stationName}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-400">
                Direct station connect. Launch WhatsApp to chat directly regarding orders, designs, or tickets.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setWhatsappModalMember(null)}
                  className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:text-white"
                >
                  Close
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── TOAST NOTIFICATION ────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0f172a] border border-amber-500/50 text-white text-xs shadow-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
