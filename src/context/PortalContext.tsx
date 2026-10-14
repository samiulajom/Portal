import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  NavTab,
  IssueItem,
  UpdateEntry,
  StationGroup,
  StationMember,
  QueueItem,
  QueueUpdate,
  ComplainItem,
  StoreAccount,
  HandoverNote,
  AnnouncementItem,
  SavedMember,
  PermissionKey,
  RoleDefinition,
  PortalUser,
  AccessAuditLog
} from '../types';
import {
  initialIssues,
  initialUpdates,
  initialStations,
  initialQueues,
  initialComplains,
  initialStores,
  initialHandovers,
  initialAnnouncements,
  initialSavedMembers,
  initialRoles,
  initialUsers,
  initialAccessLogs
} from '../data/mockData';

export interface UserProfile {
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

  // Roles & Permissions & Access Management
  roles: RoleDefinition[];
  users: PortalUser[];
  currentUser: PortalUser;
  currentRole: RoleDefinition;
  setCurrentUserId: (id: string) => void;
  isAdmin: boolean;
  hasPermission: (perm: PermissionKey, targetUser?: PortalUser) => boolean;
  canAccessTab: (tab: NavTab, targetUser?: PortalUser) => boolean;
  allowedTabs: NavTab[];
  updateRolePermissions: (roleId: string, perms: Record<PermissionKey, boolean>) => void;
  addCustomRole: (role: Omit<RoleDefinition, 'id'>) => void;
  deleteCustomRole: (roleId: string) => void;
  updateUserPermissions: (userId: string, useCustom: boolean, customPerms?: Partial<Record<PermissionKey, boolean>>) => void;
  updateUser: (userId: string, updates: Partial<PortalUser>) => void;
  addUser: (user: Omit<PortalUser, 'id'>) => PortalUser;
  deleteUser: (userId: string) => void;
  resetUserToRoleDefaults: (userId: string) => void;
  accessLogs: AccessAuditLog[];
  addAccessLog: (log: Omit<AccessAuditLog, 'id' | 'timestamp'>) => void;
  
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
  toggleTlCheck: (id: string) => boolean;
  
  stations: StationGroup[];
  addStation: (name: string, shift: StationGroup['shift'], dutyContact?: StationMember) => void;
  setStationDutyContact: (stationId: string, contact: StationMember) => void;
  addMemberToStation: (stationId: string, member: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] }, saveToPool?: boolean) => void;
  addMultipleMembersToStation: (stationId: string, members: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] }[]) => void;
  removeMemberFromStation: (stationId: string, memberId: string) => void;
  deleteStation: (stationId: string) => void;
  clearStationMembers: (stationId: string) => void;
  clearStationsMembers: (stationIds: string[]) => void;
  clearAllStationsMembers: () => void;

  savedMembers: SavedMember[];
  addMemberToPool: (member: Omit<SavedMember, 'id'>) => SavedMember;
  removeMemberFromPool: (id: string) => void;
  updateMemberInPool: (id: string, updates: Partial<SavedMember>) => void;
  resetMemberPool: () => void;
  
  queues: QueueItem[];
  addQueue: (q: Omit<QueueItem, 'id' | 'queueKey' | 'createdAt'>) => void;
  updateQueueStatus: (id: string, status: QueueItem['status']) => void;
  updateQueue: (id: string, updates: Partial<QueueItem>) => void;
  addQueueUpdate: (
    queueId: string,
    update: {
      salesPerson: string;
      comment: string;
      inboxUrl?: string;
      orderPageUrl?: string;
      imageUrl?: string;
      imageName?: string;
      otherLinks?: { id?: string; label?: string; url: string }[];
      statusChange?: QueueItem['status'];
    }
  ) => void;
  deleteQueueUpdate: (queueId: string, updateId: string) => void;
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
  USER: 'scaleup_portal_user',
  MEMBER_POOL: 'scaleup_portal_member_pool_v1',
  ROLES: 'scaleup_portal_roles_v2',
  USERS: 'scaleup_portal_users_v2',
  ACTIVE_USER_ID: 'scaleup_portal_active_user_id_v2',
  ACCESS_LOGS: 'scaleup_portal_access_logs_v2'
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem(STORAGE_KEYS.TAB) as NavTab) || 'overview';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialRoles;
  });

  const [users, setUsers] = useState<PortalUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialUsers;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (saved) return saved;
    return 'usr-1'; // Default to SAA (Admin)
  });

  const [accessLogs, setAccessLogs] = useState<AccessAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESS_LOGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialAccessLogs;
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
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((st: StationGroup) => {
            const initialMatch = initialStations.find(is => is.id === st.id) ||
                                 initialStations.find(is => is.name.toLowerCase() === st.name.toLowerCase());
            let updatedMembers = st.members || [];
            // If st-1 had 0 members in previous storage, hydrate with default initial members
            if (st.id === 'st-1' && updatedMembers.length === 0 && initialMatch?.members && initialMatch.members.length > 0) {
              updatedMembers = initialMatch.members;
            }
            const fallbackContact = st.dutyContact || initialMatch?.dutyContact || (updatedMembers.length > 0 ? updatedMembers[0] : initialSavedMembers[0]);
            return {
              ...st,
              members: updatedMembers,
              dutyContact: fallbackContact
            };
          });
        }
      } catch (e) { /* ignore */ }
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

  const [savedMembers, setSavedMembers] = useState<SavedMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBER_POOL);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialSavedMembers;
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
    localStorage.setItem(STORAGE_KEYS.MEMBER_POOL, JSON.stringify(savedMembers));
  }, [savedMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(accessLogs));
  }, [accessLogs]);

  const currentUser: PortalUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0] || initialUsers[0];
  }, [users, currentUserId]);

  const currentRole: RoleDefinition = useMemo(() => {
    return roles.find(r => r.id === currentUser.roleId) || roles[0] || initialRoles[0];
  }, [roles, currentUser]);

  const isAdmin = currentUser.roleId === 'admin';

  // Core Permission Checker: Checks if an individual user has permission (evaluates role defaults & person-wise overrides)
  const hasPermission = (perm: PermissionKey, targetUser?: PortalUser): boolean => {
    const u = targetUser || currentUser;
    if (!u) return false;
    // System Administrator has all permissions
    if (u.roleId === 'admin') return true;

    // Check if custom person-level override is active
    if (u.useCustomPermissions && u.customPermissions && perm in u.customPermissions) {
      return Boolean(u.customPermissions[perm]);
    }

    // Default to the role's configured permissions
    const roleDef = roles.find(r => r.id === u.roleId);
    if (!roleDef) return false;
    return Boolean(roleDef.permissions[perm]);
  };

  const canAccessTab = (tab: NavTab, targetUser?: PortalUser): boolean => {
    switch (tab) {
      case 'overview': return hasPermission('view_overview', targetUser);
      case 'issues': return hasPermission('view_issues', targetUser);
      case 'updates': return hasPermission('view_updates', targetUser);
      case 'stations': return hasPermission('view_stations', targetUser);
      case 'complains': return hasPermission('view_complains', targetUser);
      case 'queue': return hasPermission('view_queue', targetUser);
      case 'stores': return hasPermission('view_stores', targetUser);
      case 'handover': return hasPermission('view_handover', targetUser);
      case 'access': return hasPermission('manage_access', targetUser);
      default: return true;
    }
  };

  const allTabs: NavTab[] = ['overview', 'issues', 'updates', 'stations', 'complains', 'queue', 'stores', 'handover', 'access'];
  
  const allowedTabs: NavTab[] = useMemo(() => {
    return allTabs.filter(tab => canAccessTab(tab, currentUser));
  }, [currentUser, roles, users]);

  // Synchronized legacy user object for existing components (e.g. Header, Modals)
  const user: UserProfile = useMemo(() => {
    return {
      name: currentUser.name,
      role: currentRole ? currentRole.name : currentUser.department,
      avatarText: currentUser.avatarText,
      shift: currentUser.shift,
      isClockedIn: Boolean(currentUser.isClockedIn),
      clockInTime: currentUser.clockInTime || '07:00 AM',
      department: currentUser.department
    };
  }, [currentUser, currentRole]);

  const toggleClockIn = () => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const nextState = !u.isClockedIn;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...u,
          isClockedIn: nextState,
          clockInTime: nextState ? timeStr : '--:--'
        };
      }
      return u;
    }));
  };

  const addAccessLog = (log: Omit<AccessAuditLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AccessAuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: timeStr
    };
    setAccessLogs(prev => [newLog, ...prev]);
  };

  const setCurrentUserId = (id: string) => {
    const found = users.find(u => u.id === id);
    if (found) {
      setCurrentUserIdState(id);
      // Auto-switch to an allowed tab if currently on a restricted tab
      if (!canAccessTab(activeTab, found)) {
        const firstPermitted = allTabs.find(tab => canAccessTab(tab, found)) || 'overview';
        setActiveTabState(firstPermitted);
      }
    }
  };

  const updateRolePermissions = (roleId: string, perms: Record<PermissionKey, boolean>) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: perms } : r));
    const role = roles.find(r => r.id === roleId);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'UPDATE_ROLE',
      targetName: role?.name || roleId,
      details: `Updated baseline permissions for role ${role?.name || roleId}`
    });
  };

  const addCustomRole = (roleData: Omit<RoleDefinition, 'id'>) => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: `role-${Date.now()}`
    };
    setRoles(prev => [...prev, newRole]);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'CREATE_ROLE',
      targetName: newRole.name,
      details: `Created new custom role ${newRole.name}`
    });
  };

  const deleteCustomRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) return;
    setUsers(prev => prev.map(u => u.roleId === roleId ? { ...u, roleId: 'employee' } : u));
    setRoles(prev => prev.filter(r => r.id !== roleId));
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'DELETE_USER',
      targetName: role?.name || roleId,
      details: `Deleted role ${role?.name || roleId}`
    });
  };

  const updateUserPermissions = (userId: string, useCustom: boolean, customPerms?: Partial<Record<PermissionKey, boolean>>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          useCustomPermissions: useCustom,
          customPermissions: customPerms || u.customPermissions || {}
        };
      }
      return u;
    }));
    const target = users.find(u => u.id === userId);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'UPDATE_USER_PERMISSIONS',
      targetName: target?.name || userId,
      details: useCustom 
        ? `Applied custom person-level permission overrides (${Object.keys(customPerms || {}).length} configured)`
        : `Reset to role default permissions`
    });
  };

  const updateUser = (userId: string, updates: Partial<PortalUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    const target = users.find(u => u.id === userId);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'UPDATE_ROLE',
      targetName: updates.name || target?.name || userId,
      details: updates.roleId ? `Role changed to ${roles.find(r => r.id === updates.roleId)?.name || updates.roleId}` : `Profile details updated`
    });
  };

  const addUser = (userData: Omit<PortalUser, 'id'>) => {
    const newUser: PortalUser = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'CREATE_USER',
      targetName: newUser.name,
      details: `Created new user account with role: ${roles.find(r => r.id === newUser.roleId)?.name || newUser.roleId}`
    });
    return newUser;
  };

  const deleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target?.roleId === 'admin' && users.filter(u => u.roleId === 'admin').length <= 1) {
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      const firstAdmin = users.find(u => u.id !== userId && u.roleId === 'admin') || users[0];
      if (firstAdmin) setCurrentUserIdState(firstAdmin.id);
    }
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'DELETE_USER',
      targetName: target?.name || userId,
      details: `User account deleted`
    });
  };

  const resetUserToRoleDefaults = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          useCustomPermissions: false,
          customPermissions: {}
        };
      }
      return u;
    }));
    const target = users.find(u => u.id === userId);
    addAccessLog({
      actorName: currentUser.name,
      actorRole: currentRole?.name || 'Administrator',
      action: 'RESET_PERMISSIONS',
      targetName: target?.name || userId,
      details: `Reset to role default permissions`
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

  const toggleTlCheck = (id: string): boolean => {
    // Role & Permission enforcement: Only Admin and Team Leader (or explicit approve_updates permission)
    const canApprove = hasPermission('approve_updates') || currentUser.roleId === 'admin' || currentUser.roleId === 'team_leader';
    if (!canApprove) {
      return false;
    }

    const now = new Date();
    const timeStr = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${currentUser?.name ? currentUser.name.split(' ')[0] : 'TL'})`;

    setUpdates(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextCheck = !u.tlCheck;
          return {
            ...u,
            tlCheck: nextCheck,
            tlAt: nextCheck ? timeStr : '—'
          };
        }
        return u;
      })
    );
    return true;
  };

  // Stations handlers
  const addStation = (name: string, shift: StationGroup['shift'], dutyContact?: StationMember) => {
    const id = `st-${Date.now()}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Default duty contact
    const contact = dutyContact || {
      id: `mem-${Date.now()}-lead`,
      name: user.name || 'Station In-Charge',
      initials: (user.name || 'SC').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'SC',
      role: 'Station In-Charge',
      phoneWhatsapp: '+8801712000000'
    };

    setStations(prev => [
      ...prev,
      {
        id,
        name,
        shift,
        updatedAt: dateStr,
        members: [contact],
        dutyContact: contact
      }
    ]);
  };

  const setStationDutyContact = (stationId: string, contact: StationMember) => {
    setStations(prev =>
      prev.map(st => (st.id === stationId ? { ...st, dutyContact: contact } : st))
    );
  };

  const addMemberToStation = (
    stationId: string,
    member: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] },
    saveToPool: boolean = true
  ) => {
    const memId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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

    // Auto save to master member pool if requested
    if (saveToPool && member.name.trim()) {
      setSavedMembers(prev => {
        const exists = prev.some(m => m.name.trim().toLowerCase() === member.name.trim().toLowerCase());
        if (!exists) {
          const newSaved: SavedMember = {
            id: `smem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: member.name.trim(),
            initials: member.initials,
            role: member.role,
            phoneWhatsapp: member.phoneWhatsapp,
            profileNames: member.profileNames
          };
          return [newSaved, ...prev];
        }
        return prev;
      });
    }
  };

  const addMultipleMembersToStation = (
    stationId: string,
    membersList: { name: string; initials: string; role?: string; phoneWhatsapp?: string; profileNames?: string[] }[]
  ) => {
    if (membersList.length === 0) return;
    setStations(prev =>
      prev.map(st => {
        if (st.id === stationId) {
          const newMembers = membersList.map((m, idx) => ({
            id: `mem-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
            ...m
          }));
          return {
            ...st,
            members: [...st.members, ...newMembers]
          };
        }
        return st;
      })
    );
  };

  const addMemberToPool = (member: Omit<SavedMember, 'id'>) => {
    const existing = savedMembers.find(m => m.name.trim().toLowerCase() === member.name.trim().toLowerCase());
    if (existing) {
      const updated = { ...existing, ...member };
      setSavedMembers(prev => prev.map(m => m.id === existing.id ? updated : m));
      return updated;
    }
    const newMember: SavedMember = {
      ...member,
      id: `smem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setSavedMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  const removeMemberFromPool = (id: string) => {
    setSavedMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMemberInPool = (id: string, updates: Partial<SavedMember>) => {
    setSavedMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const resetMemberPool = () => {
    setSavedMembers(initialSavedMembers);
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

  const clearStationsMembers = (stationIds: string[]) => {
    const idsSet = new Set(stationIds);
    setStations(prev =>
      prev.map(st => idsSet.has(st.id) ? { ...st, members: [] } : st)
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
      updates: q.updates || [],
      id: `qu-${Date.now()}`,
      queueKey: `QU-${randomNum}`,
      createdAt: 'Just now'
    };
    setQueues(prev => [newItem, ...prev]);
  };

  const updateQueueStatus = (id: string, status: QueueItem['status']) => {
    setQueues(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
  };

  const updateQueue = (id: string, updates: Partial<QueueItem>) => {
    setQueues(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addQueueUpdate = (
    queueId: string,
    update: {
      salesPerson: string;
      comment: string;
      inboxUrl?: string;
      orderPageUrl?: string;
      imageUrl?: string;
      imageName?: string;
      otherLinks?: { id?: string; label?: string; url: string }[];
      statusChange?: QueueItem['status'];
    }
  ) => {
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newUpdate: QueueUpdate = {
      id: `qup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: formattedTime,
      salesPerson: update.salesPerson.trim() || 'Sales Rep',
      comment: update.comment.trim(),
      inboxUrl: update.inboxUrl?.trim() || undefined,
      orderPageUrl: update.orderPageUrl?.trim() || undefined,
      imageUrl: update.imageUrl,
      imageName: update.imageName,
      otherLinks: update.otherLinks && update.otherLinks.length > 0
        ? update.otherLinks
            .filter(l => l.url && l.url.trim())
            .map((l, idx) => ({
              id: l.id || `lnk-${Date.now()}-${idx}`,
              label: l.label?.trim() || 'Link',
              url: l.url.trim()
            }))
        : undefined,
      statusChange: update.statusChange
    };

    setQueues(prev =>
      prev.map(q => {
        if (q.id === queueId) {
          const currentUpdates = q.updates || [];
          return {
            ...q,
            status: update.statusChange || q.status,
            conversationUrl: update.inboxUrl?.trim() || q.conversationUrl,
            orderPageUrl: update.orderPageUrl?.trim() || q.orderPageUrl,
            updates: [newUpdate, ...currentUpdates]
          };
        }
        return q;
      })
    );
  };

  const deleteQueueUpdate = (queueId: string, updateId: string) => {
    setQueues(prev =>
      prev.map(q => {
        if (q.id === queueId) {
          return {
            ...q,
            updates: (q.updates || []).filter(u => u.id !== updateId)
          };
        }
        return q;
      })
    );
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
    setRoles(initialRoles);
    setUsers(initialUsers);
    setCurrentUserIdState('usr-1');
    setAccessLogs(initialAccessLogs);
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
        roles,
        users,
        currentUser,
        currentRole,
        setCurrentUserId,
        isAdmin,
        hasPermission,
        canAccessTab,
        allowedTabs,
        updateRolePermissions,
        addCustomRole,
        deleteCustomRole,
        updateUserPermissions,
        updateUser,
        addUser,
        deleteUser,
        resetUserToRoleDefaults,
        accessLogs,
        addAccessLog,
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
        resetMemberPool,
        queues,
        addQueue,
        updateQueueStatus,
        updateQueue,
        addQueueUpdate,
        deleteQueueUpdate,
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
