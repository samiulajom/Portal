import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavTab,
  IssueItem,
  UpdateEntry,
  StationGroup,
  QueueItem,
  ComplainItem,
  StoreAccount,
  HandoverNote,
  AnnouncementItem
} from '../types';
import {
  initialIssues,
  initialUpdates,
  initialStations,
  initialQueues,
  initialComplains,
  initialStores,
  initialHandovers,
  initialAnnouncements
} from '../data/mockData';

interface UserProfile {
  name: string;
  role: string;
  avatarText: string;
  shift: string;
  isClockedIn: boolean;
  clockInTime: string;
  department: string;
}

interface PortalContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  user: UserProfile;
  toggleClockIn: () => void;
  
  issues: IssueItem[];
  issueTeamFilter: string;
  setIssueTeamFilter: (team: string) => void;
  addIssue: (issue: Omit<IssueItem, 'id'>) => void;
  updateIssue: (id: string, updated: Partial<IssueItem>) => void;
  deleteIssue: (id: string) => void;
  deleteMultipleIssues: (ids: string[]) => void;
  deleteAllDoneIssues: () => void;
  completeIssue: (id: string, resolutionNote: string, logToUpdateSheet?: boolean) => void;
  reopenIssue: (id: string) => void;
  
  updates: UpdateEntry[];
  updateProfileFilter: string;
  setUpdateProfileFilter: (profile: string) => void;
  addUpdate: (entry: Omit<UpdateEntry, 'id'>) => void;
  updateUpdate: (id: string, updated: Partial<UpdateEntry>) => void;
  deleteUpdate: (id: string) => void;
  toggleTlCheck: (id: string) => void;
  
  stations: StationGroup[];
  addStation: (name: string, shift: StationGroup['shift']) => void;
  addMemberToStation: (stationId: string, member: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] }) => void;
  removeMemberFromStation: (stationId: string, memberId: string) => void;
  deleteStation: (stationId: string) => void;
  clearStationMembers: (stationId: string) => void;
  clearAllStationsMembers: () => void;
  
  queues: QueueItem[];
  addQueue: (q: Omit<QueueItem, 'id' | 'queueKey' | 'createdAt'>) => void;
  updateQueueStatus: (id: string, status: QueueItem['status']) => void;
  deleteQueue: (id: string) => void;
  deleteAllQueues: () => void;
  
  complains: ComplainItem[];
  addComplain: (cmp: Omit<ComplainItem, 'id' | 'ticketNo' | 'date'>) => void;
  updateComplainStatus: (id: string, status: ComplainItem['status'], resolution?: string) => void;
  deleteComplain: (id: string) => void;
  
  stores: StoreAccount[];
  addStore: (st: Omit<StoreAccount, 'id'>) => void;
  
  handovers: HandoverNote[];
  addHandover: (note: Omit<HandoverNote, 'id' | 'date' | 'status' | 'receivedBy'>) => void;
  acknowledgeHandover: (id: string, receiverName: string) => void;
  
  announcements: AnnouncementItem[];
  isAnnouncementsOpen: boolean;
  setIsAnnouncementsOpen: (open: boolean) => void;
  
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;

  resetAllData: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TAB: 'scaleup_portal_tab',
  THEME: 'scaleup_portal_theme',
  ISSUES: 'scaleup_portal_issues_v2',
  UPDATES: 'scaleup_portal_updates_v2',
  STATIONS: 'scaleup_portal_stations',
  QUEUES: 'scaleup_portal_queues',
  COMPLAINS: 'scaleup_portal_complains',
  STORES: 'scaleup_portal_stores',
  HANDOVERS: 'scaleup_portal_handovers',
  USER: 'scaleup_portal_user'
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem(STORAGE_KEYS.TAB) as NavTab) || 'overview';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Md Samiul Ajom',
      role: 'Jr. Shopify Developer',
      avatarText: 'SA',
      shift: 'Morning Shift',
      isClockedIn: true,
      clockInTime: '07:15 AM',
      department: 'Shopify Dev'
    };
  });

  const [issues, setIssues] = useState<IssueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialIssues;
  });

  const [issueTeamFilter, setIssueTeamFilter] = useState<string>('All');

  const [updates, setUpdates] = useState<UpdateEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UPDATES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialUpdates;
  });

  const [updateProfileFilter, setUpdateProfileFilter] = useState<string>('All');

  const [stations, setStations] = useState<StationGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialStations;
  });

  const [queues, setQueues] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialQueues;
  });

  const [complains, setComplains] = useState<ComplainItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialComplains;
  });

  const [stores, setStores] = useState<StoreAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialStores;
  });

  const [handovers, setHandovers] = useState<HandoverNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HANDOVERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialHandovers;
  });

  const [announcements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync tab
  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    localStorage.setItem(STORAGE_KEYS.TAB, tab);
  };

  // Sync theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUES, JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINS, JSON.stringify(complains));
  }, [complains]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HANDOVERS, JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  const toggleClockIn = () => {
    setUser(prev => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        ...prev,
        isClockedIn: !prev.isClockedIn,
        clockInTime: !prev.isClockedIn ? timeStr : prev.clockInTime
      };
    });
  };

  // Issues handlers
  const addIssue = (newIssue: Omit<IssueItem, 'id'>) => {
    const id = `iss-${Date.now()}`;
    setIssues(prev => [{ ...newIssue, id }, ...prev]);
  };

  const updateIssue = (id: string, updated: Partial<IssueItem>) => {
    setIssues(prev => prev.map(iss => (iss.id === id ? { ...iss, ...updated } : iss)));
  };

  const deleteIssue = (id: string) => {
    setIssues(prev => prev.filter(iss => iss.id !== id));
  };

  const deleteMultipleIssues = (ids: string[]) => {
    const idSet = new Set(ids);
    setIssues(prev => prev.filter(iss => !idSet.has(iss.id)));
  };

  const deleteAllDoneIssues = () => {
    setIssues(prev => prev.filter(iss => iss.status !== 'done'));
  };

  const completeIssue = (id: string, resolutionNote: string, logToUpdateSheet: boolean = true) => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    setIssues(prev => {
      const target = prev.find(i => i.id === id);
      if (target && logToUpdateSheet) {
        const updId = `upd-${Date.now()}`;
        setUpdates(prevUpd => [
          {
            id: updId,
            date: dateStr,
            profile: target.profile,
            clientName: target.clientName,
            updateBy: `@${user.name.split(' ')[0].toLowerCase()}`,
            message: `[Work Log / Resolution] ${resolutionNote}`,
            commentOperation: 'Resolved & Done',
            commentSales: target.specialNotes || 'Issue addressed by Dev team.',
            tlCheck: false,
            tlAt: '@Sushmoy',
            updateTo: 'Inbox & Order',
            doneBy: user.name
          },
          ...prevUpd
        ]);
      }
      return prev.map(iss =>
        iss.id === id
          ? {
              ...iss,
              status: 'done' as const,
              resolutionNote,
              completedAt: dateStr,
              completedBy: user.name
            }
          : iss
      );
    });
  };

  const reopenIssue = (id: string) => {
    setIssues(prev =>
      prev.map(iss =>
        iss.id === id
          ? { ...iss, status: 'in progress' as const }
          : iss
      )
    );
  };

  // Updates handlers
  const addUpdate = (entry: Omit<UpdateEntry, 'id'>) => {
    const id = `upd-${Date.now()}`;
    setUpdates(prev => [{ ...entry, id }, ...prev]);
  };

  const updateUpdate = (id: string, updated: Partial<UpdateEntry>) => {
    setUpdates(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
  };

  const deleteUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  const toggleTlCheck = (id: string) => {
    setUpdates(prev =>
      prev.map(u => (u.id === id ? { ...u, tlCheck: !u.tlCheck } : u))
    );
  };

  // Stations handlers
  const addStation = (name: string, shift: StationGroup['shift']) => {
    const id = `st-${Date.now()}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setStations(prev => [
      ...prev,
      {
        id,
        name,
        shift,
        updatedAt: dateStr,
        members: []
      }
    ]);
  };

  const addMemberToStation = (
    stationId: string,
    member: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] }
  ) => {
    const memId = `mem-${Date.now()}`;
    setStations(prev =>
      prev.map(st => {
        if (st.id === stationId) {
          return {
            ...st,
            members: [...st.members, { id: memId, ...member }]
          };
        }
        return st;
      })
    );
  };

  const removeMemberFromStation = (stationId: string, memberId: string) => {
    setStations(prev =>
      prev.map(st => {
        if (st.id === stationId) {
          return {
            ...st,
            members: st.members.filter(m => m.id !== memberId)
          };
        }
        return st;
      })
    );
  };

  const deleteStation = (stationId: string) => {
    setStations(prev => prev.filter(st => st.id !== stationId));
  };

  const clearStationMembers = (stationId: string) => {
    setStations(prev =>
      prev.map(st => st.id === stationId ? { ...st, members: [] } : st)
    );
  };

  const clearAllStationsMembers = () => {
    setStations(prev => prev.map(st => ({ ...st, members: [] })));
  };

  // Queue handlers
  const addQueue = (q: Omit<QueueItem, 'id' | 'queueKey' | 'createdAt'>) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newItem: QueueItem = {
      ...q,
      id: `qu-${Date.now()}`,
      queueKey: `QU-${randomNum}`,
      createdAt: 'Just now'
    };
    setQueues(prev => [newItem, ...prev]);
  };

  const updateQueueStatus = (id: string, status: QueueItem['status']) => {
    setQueues(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
  };

  const deleteQueue = (id: string) => {
    setQueues(prev => prev.filter(q => q.id !== id));
  };

  const deleteAllQueues = () => {
    setQueues([]);
  };

  // Complains handlers
  const addComplain = (cmp: Omit<ComplainItem, 'id' | 'ticketNo' | 'date'>) => {
    const randomTicket = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newItem: ComplainItem = {
      ...cmp,
      id: `cmp-${Date.now()}`,
      ticketNo: `CMP-${randomTicket}`,
      date: dateStr
    };
    setComplains(prev => [newItem, ...prev]);
  };

  const updateComplainStatus = (id: string, status: ComplainItem['status'], resolution?: string) => {
    setComplains(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status,
              ...(resolution ? { resolutionNote: resolution } : {})
            }
          : c
      )
    );
  };

  const deleteComplain = (id: string) => {
    setComplains(prev => prev.filter(c => c.id !== id));
  };

  // Stores
  const addStore = (st: Omit<StoreAccount, 'id'>) => {
    setStores(prev => [{ ...st, id: `str-${Date.now()}` }, ...prev]);
  };

  // Handover
  const addHandover = (note: Omit<HandoverNote, 'id' | 'date' | 'status' | 'receivedBy'>) => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newHo: HandoverNote = {
      ...note,
      id: `ho-${Date.now()}`,
      date: dateStr,
      status: 'Pending Ack',
      receivedBy: 'Pending Incoming Lead'
    };
    setHandovers(prev => [newHo, ...prev]);
  };

  const acknowledgeHandover = (id: string, receiverName: string) => {
    setHandovers(prev =>
      prev.map(h =>
        h.id === id
          ? {
              ...h,
              status: 'Acknowledged',
              receivedBy: receiverName
            }
          : h
      )
    );
  };

  const resetAllData = () => {
    setIssues(initialIssues);
    setUpdates(initialUpdates);
    setStations(initialStations);
    setQueues(initialQueues);
    setComplains(initialComplains);
    setStores(initialStores);
    setHandovers(initialHandovers);
  };

  return (
    <PortalContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        user,
        toggleClockIn,
        issues,
        issueTeamFilter,
        setIssueTeamFilter,
        addIssue,
        updateIssue,
        deleteIssue,
        deleteMultipleIssues,
        deleteAllDoneIssues,
        completeIssue,
        reopenIssue,
        updates,
        updateProfileFilter,
        setUpdateProfileFilter,
        addUpdate,
        updateUpdate,
        deleteUpdate,
        toggleTlCheck,
        stations,
        addStation,
        addMemberToStation,
        removeMemberFromStation,
        deleteStation,
        clearStationMembers,
        clearAllStationsMembers,
        queues,
        addQueue,
        updateQueueStatus,
        deleteQueue,
        deleteAllQueues,
        complains,
        addComplain,
        updateComplainStatus,
        deleteComplain,
        stores,
        addStore,
        handovers,
        addHandover,
        acknowledgeHandover,
        announcements,
        isAnnouncementsOpen,
        setIsAnnouncementsOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isProfileOpen,
        setIsProfileOpen,
        resetAllData
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
