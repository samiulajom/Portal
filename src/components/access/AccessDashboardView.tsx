import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Key, 
  Sliders, 
  Search, 
  Plus, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Filter, 
  Sparkles, 
  History, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { PermissionKey, RoleDefinition, PortalUser, NavTab } from '../../types';

// Permission category definition for clear visual grouping
interface PermissionCategory {
  title: string;
  description: string;
  permissions: {
    key: PermissionKey;
    label: string;
    description: string;
    isDestructive?: boolean;
  }[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    title: 'Module Navigation & Visibility',
    description: 'Controls which sections appear in the sidebar and can be accessed',
    permissions: [
      { key: 'view_overview', label: 'Overview Dashboard', description: 'View agency KPI cards, quick metrics & distribution charts' },
      { key: 'view_queue', label: 'Queue Management', description: 'Access operational queue requests and order cards' },
      { key: 'view_updates', label: 'Update Sheet', description: 'View real-time client communication and update logs' },
      { key: 'view_issues', label: 'Issue Sheet', description: 'Track order bugs, dev blockers and delivery revisions' },
      { key: 'view_stations', label: 'Station & Shifts', description: 'View shift station rosters, online status & member list' },
      { key: 'view_complains', label: 'Complains Hub', description: 'Review buyer dissatisfaction tickets and risk cases' },
      { key: 'view_stores', label: 'Store Matrix', description: 'Inspect store accounts, marketplace platforms & order volume' },
      { key: 'view_handover', label: 'Daily Handover', description: 'Read shift-to-shift transition briefings and notes' },
      { key: 'manage_access', label: 'Access & Role Admin', description: 'Access this RBAC Dashboard to manage roles & permissions', isDestructive: true }
    ]
  },
  {
    title: 'Overview Dashboard Sections & Widgets (ওভারভিউ পারমিশন)',
    description: 'Control granular visibility of each sub-view inside the Overview tab',
    permissions: [
      { key: 'overview_view_kpi', label: 'Primary KPI Cards', description: 'Issue Open, WIP, and Resolved high-level counter cards' },
      { key: 'overview_view_operations_wip', label: 'Operations & Team WIP Matrix', description: 'Team-Wise Status & WIP Matrix (টিমভিত্তিক ইস্যু সামারি)' },
      { key: 'overview_view_sales_updates', label: 'Sales Update Sheet Status', description: 'Profile-wise client messages sent vs pending breakdown' },
      { key: 'overview_view_velocity', label: 'Daily Operational Velocity', description: 'Queue counters, active stations, fiverr stores & quick actions' },
      { key: 'overview_view_stations_spotlight', label: 'Station Roster & Shift Note Spotlight', description: 'Shift stations staffing spotlight & latest handover note preview' },
      { key: 'overview_view_recent_activity', label: 'Recent Communication Activity Feed', description: 'Recent client messages table preview with TL status' }
    ]
  },
  {
    title: 'Queue & Sales Operations',
    description: 'Capabilities for queue requests, client notes and post-sales actions',
    permissions: [
      { key: 'create_queue', label: 'Create Queue Requests', description: 'Salespersons can initiate client help / task queues' },
      { key: 'process_queue', label: 'Process / Post-Sales Update', description: 'Submit dev responses and mark queues as Given' },
      { key: 'delete_queue', label: 'Delete Queue Records', description: 'Remove queue items from the system', isDestructive: true }
    ]
  },
  {
    title: 'Update Sheet Granular Features (আপডেট শিট ফিচারভিত্তিক এক্সেস)',
    description: 'Fine-grained permissions for every single feature inside the Update Sheet module',
    permissions: [
      { key: 'create_updates', label: 'Add Updates (নতুন এন্ট্রি যোগ)', description: 'Access Add Entry form and submit new client update entries' },
      { key: 'edit_updates', label: 'Edit Existing Updates (এন্ট্রি এডিট)', description: 'Modify remarks, message content, profile, or assignees' },
      { key: 'delete_updates', label: 'Delete Update Entries (এন্ট্রি ডিলিট)', description: 'Permanently remove update entries from the live sheet', isDestructive: true },
      { key: 'approve_updates', label: 'TL Check & Verification (টিএল ভেরিফিকেশন)', description: 'Mark Team Leader checkmark. Restricted to Admin & TL by default.' },
      { key: 'send_updates', label: 'Mark as Sent / Complete (সেন্ড ও কমপ্লিট)', description: 'Send message to client and archive entry into the Done/Completed list' },
      { key: 'reopen_updates', label: 'Restore / Reopen Entry (ডান থেকে রিস্টোর)', description: 'Restore archived entries from Done list back into Active/Pending list' },
      { key: 'export_updates', label: 'Export Update Sheet (সিএসভি এক্সপোর্ট)', description: 'Download CSV spreadsheet export of filtered update entries' },
      { key: 'view_completed_updates', label: 'View Done / Completed Tab (কমপ্লিটেড ট্যাব)', description: 'Inspect sent/archived client message history in the Done tab' },
      { key: 'view_message_details', label: 'View Message Details Modal (মেসেজ মডাল ও কপি)', description: 'Open full message modal dialog and copy message text to clipboard' },
      { key: 'edit_operation_comment', label: 'Edit Comment - Operation (অপারেশন কমেন্ট)', description: 'Write or modify operational notes (delivery days, status)' },
      { key: 'edit_sales_comment', label: 'Edit Comment - Sales (সেলস কমেন্ট)', description: 'Write or modify sales instructions and client revision notes' }
    ]
  },
  {
    title: 'Issues, Stations & Handover Management',
    description: 'Dev tickets, shift staffing rosters, and team transition',
    permissions: [
      { key: 'create_issues', label: 'Create Issue Tickets', description: 'Report urgent bugs or revision requests' },
      { key: 'resolve_issues', label: 'Resolve & Complete Issues', description: 'Mark issues done and post resolution notes' },
      { key: 'manage_stations', label: 'Manage Stations & Clear', description: 'Add/remove stations and reset rosters' },
      { key: 'manage_station_members', label: 'Assign Station Staff', description: 'Add/remove operators to active shift stations' },
      { key: 'create_complains', label: 'Log Client Complaints', description: 'Register buyer escalation tickets' },
      { key: 'resolve_complains', label: 'Mediate Complaints', description: 'Update complaint status and record resolutions' },
      { key: 'manage_stores', label: 'Manage Store Matrix', description: 'Add or update client store profiles' },
      { key: 'create_handover', label: 'Create Shift Handover', description: 'Draft and submit shift transition notes' },
      { key: 'acknowledge_handover', label: 'Acknowledge Handover', description: 'Incoming lead sign-off on shift handovers' }
    ]
  },
  {
    title: 'Data Governance & Administrative Actions',
    description: 'Sensitive exports and destructive deletion actions',
    permissions: [
      { key: 'export_data', label: 'Export Data & CSV', description: 'Download CSV reports and operational summaries' },
      { key: 'delete_records', label: 'Bulk Record Deletion', description: 'Permission to purge completed items or issues', isDestructive: true }
    ]
  }
];

export const AccessDashboardView: React.FC = () => {
  const { 
    roles, 
    users, 
    currentUser, 
    currentRole, 
    setCurrentUserId, 
    isAdmin, 
    hasPermission,
    updateRolePermissions, 
    addCustomRole, 
    deleteCustomRole,
    updateUserPermissions, 
    updateUser, 
    addUser, 
    deleteUser, 
    resetUserToRoleDefaults, 
    accessLogs 
  } = usePortal();

  // Sub-tabs in Access Control Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix' | 'simulator' | 'audit'>('users');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [overrideFilter, setOverrideFilter] = useState<'All' | 'custom' | 'default'>('All');

  // Modals state
  const [editingUserPermissions, setEditingUserPermissions] = useState<PortalUser | null>(null);
  const [customPermsDraft, setCustomPermsDraft] = useState<Partial<Record<PermissionKey, boolean>>>({});
  const [useCustomDraft, setUseCustomDraft] = useState(false);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [editingUserDetails, setEditingUserDetails] = useState<PortalUser | null>(null);
  const [editingUserEditForm, setEditingUserEditForm] = useState<{
    name: string;
    email: string;
    roleId: string;
    department: string;
    shift: string;
    phoneWhatsapp: string;
    status: 'Active' | 'Inactive' | 'On Leave';
  }>({
    name: '',
    email: '',
    roleId: 'operation_member',
    department: 'Operations',
    shift: 'Morning Shift',
    phoneWhatsapp: '',
    status: 'Active'
  });

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    roleId: 'operation_member',
    department: 'Operations',
    shift: 'Morning Shift',
    phoneWhatsapp: '+8801'
  });
  const [newUserUseCustomPermissions, setNewUserUseCustomPermissions] = useState(false);
  const [newUserCustomPerms, setNewUserCustomPerms] = useState<Partial<Record<PermissionKey, boolean>>>({});

  // New custom role form state
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
    badgeColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/30'
  });

  // Simulator target role / user
  const [simulatorTargetId, setSimulatorTargetId] = useState<string>(currentUser.id);

  // Departments list for filtering
  const departments = useMemo(() => {
    const set = new Set(users.map(u => u.department));
    return ['All', ...Array.from(set)];
  }, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'All' || u.department === departmentFilter;
      const matchRole = roleFilter === 'All' || u.roleId === roleFilter;
      const matchOverride = overrideFilter === 'All' ||
                            (overrideFilter === 'custom' && u.useCustomPermissions) ||
                            (overrideFilter === 'default' && !u.useCustomPermissions);
      return matchSearch && matchDept && matchRole && matchOverride;
    });
  }, [users, searchQuery, departmentFilter, roleFilter, overrideFilter]);

  // Open modal for person-specific permission override configuration
  const handleOpenConfigureAccess = (targetUser: PortalUser) => {
    setEditingUserPermissions(targetUser);
    setUseCustomDraft(Boolean(targetUser.useCustomPermissions));
    // If user already has custom perms, copy them; otherwise, seed from their role's defaults
    const roleDef = roles.find(r => r.id === targetUser.roleId) || roles[0];
    const initialPerms = targetUser.customPermissions && Object.keys(targetUser.customPermissions).length > 0
      ? { ...targetUser.customPermissions }
      : { ...roleDef.permissions };
    setCustomPermsDraft(initialPerms);
  };

  // Open modal to add a new team member
  const handleOpenAddUserModal = () => {
    const defaultRoleId = 'operation_member';
    const roleDef = roles.find(r => r.id === defaultRoleId) || roles[0];
    setNewUserForm({
      name: '',
      email: '',
      roleId: defaultRoleId,
      department: 'Operations',
      shift: 'Morning Shift',
      phoneWhatsapp: '+8801'
    });
    setNewUserUseCustomPermissions(false);
    setNewUserCustomPerms(roleDef ? { ...roleDef.permissions } : {});
    setIsAddUserModalOpen(true);
  };

  // When changing role in Add Member, auto-suggest department and auto-seed permissions
  const handleRoleSelectInAddUser = (newRoleId: string) => {
    let suggestedDept = newUserForm.department;
    if (newRoleId === 'admin' || newRoleId === 'gm') {
      suggestedDept = 'Management';
    } else if (newRoleId === 'sales_manager' || newRoleId === 'sells_member') {
      suggestedDept = 'Sales';
    } else if (newRoleId === 'operation_manager' || newRoleId === 'team_leader' || newRoleId === 'operation_member') {
      suggestedDept = 'Operations';
    }

    setNewUserForm(prev => ({
      ...prev,
      roleId: newRoleId,
      department: suggestedDept
    }));

    const roleDef = roles.find(r => r.id === newRoleId);
    if (roleDef) {
      setNewUserCustomPerms({ ...roleDef.permissions });
    }
  };

  // Open modal to edit existing member details & role
  const handleOpenEditUserModal = (targetUser: PortalUser) => {
    setEditingUserDetails(targetUser);
    setEditingUserEditForm({
      name: targetUser.name,
      email: targetUser.email,
      roleId: targetUser.roleId,
      department: targetUser.department,
      shift: targetUser.shift,
      phoneWhatsapp: targetUser.phoneWhatsapp || '',
      status: targetUser.status
    });
  };

  // Save edited member details
  const handleSaveEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserDetails || !editingUserEditForm.name.trim() || !editingUserEditForm.email.trim()) return;

    updateUser(editingUserDetails.id, {
      name: editingUserEditForm.name.trim(),
      email: editingUserEditForm.email.trim(),
      roleId: editingUserEditForm.roleId,
      department: editingUserEditForm.department,
      shift: editingUserEditForm.shift,
      phoneWhatsapp: editingUserEditForm.phoneWhatsapp.trim(),
      status: editingUserEditForm.status
    });

    setEditingUserDetails(null);
  };

  // Save person-specific permissions
  const handleSaveUserPermissions = () => {
    if (!editingUserPermissions) return;
    updateUserPermissions(editingUserPermissions.id, useCustomDraft, customPermsDraft);
    setEditingUserPermissions(null);
  };

  // Reset a person back to their role's baseline permissions
  const handleResetToRoleDefaults = (userId: string) => {
    resetUserToRoleDefaults(userId);
    if (editingUserPermissions && editingUserPermissions.id === userId) {
      const roleDef = roles.find(r => r.id === editingUserPermissions.roleId) || roles[0];
      setUseCustomDraft(false);
      setCustomPermsDraft({ ...roleDef.permissions });
    }
  };

  // Handle adding a new user
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) return;
    
    // Generate initials
    const parts = newUserForm.name.trim().split(' ');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    addUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      avatarText: initials,
      roleId: newUserForm.roleId,
      department: newUserForm.department,
      shift: newUserForm.shift,
      phoneWhatsapp: newUserForm.phoneWhatsapp,
      isClockedIn: false,
      clockInTime: '--:--',
      status: 'Active',
      useCustomPermissions: newUserUseCustomPermissions,
      customPermissions: newUserUseCustomPermissions ? newUserCustomPerms : undefined
    });

    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      roleId: 'operation_member',
      department: 'Operations',
      shift: 'Morning Shift',
      phoneWhatsapp: '+8801'
    });
    setNewUserUseCustomPermissions(false);
  };

  // Handle adding a custom role
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    // Start with basic operation member permissions
    const baseEmp = roles.find(r => r.id === 'operation_member') || roles[0];
    addCustomRole({
      name: newRoleForm.name.trim(),
      description: newRoleForm.description.trim() || 'Custom department role',
      badgeColor: newRoleForm.badgeColor,
      badgeBg: newRoleForm.badgeBg,
      permissions: { ...baseEmp.permissions }
    });

    setIsNewRoleModalOpen(false);
    setNewRoleForm({
      name: '',
      description: '',
      badgeColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/30'
    });
    setActiveSubTab('matrix');
  };

  // Toggle role permission cell in the matrix
  const handleToggleRolePermission = (roleId: string, permKey: PermissionKey) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    // Prevent removing admin access to manage_access
    if (role.id === 'admin' && permKey === 'manage_access') return;

    const currentVal = Boolean(role.permissions[permKey]);
    const updated = {
      ...role.permissions,
      [permKey]: !currentVal
    };
    updateRolePermissions(roleId, updated);
  };

  // Simulator user
  const simulatorUser = useMemo(() => {
    return users.find(u => u.id === simulatorTargetId) || currentUser;
  }, [users, simulatorTargetId, currentUser]);

  const simulatorRole = useMemo(() => {
    return roles.find(r => r.id === simulatorUser.roleId) || roles[0];
  }, [roles, simulatorUser]);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0c0f17] via-[#121722] to-[#0c0f17] border border-[#1e2738] p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Security & RBAC Dashboard
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Roles & Access Management
            </h1>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Configure baseline access for standard roles (Sales, TL, Admin, Specialist), or customize exact permissions for individual team members with personal access overrides.
            </p>
          </div>

          {/* Quick Active Identity & Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-[#131926] border border-[#222e42] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-amber-500 to-yellow-400 text-black font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {currentUser.avatarText}
              </div>
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${currentRole.badgeColor} ${currentRole.badgeBg}`}>
                    {currentRole.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b] truncate">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={handleOpenAddUserModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#1c2433]">
          <div className="p-3.5 rounded-xl bg-[#0e121a]/80 border border-[#1b2331]">
            <p className="text-[11px] font-medium text-[#64748b]">Total Registered Users</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white font-mono">{users.length}</span>
              <span className="text-[10px] text-emerald-400 font-medium">100% active</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121a]/80 border border-[#1b2331]">
            <p className="text-[11px] font-medium text-[#64748b]">Standard & Custom Roles</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white font-mono">{roles.length}</span>
              <span className="text-[10px] text-sky-400 font-medium">8 baseline presets</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121a]/80 border border-[#1b2331]">
            <p className="text-[11px] font-medium text-[#64748b]">Custom User Overrides</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-amber-400 font-mono">
                {users.filter(u => u.useCustomPermissions).length}
              </span>
              <span className="text-[10px] text-amber-400/80 font-medium">person-specific</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121a]/80 border border-[#1b2331]">
            <p className="text-[11px] font-medium text-[#64748b]">Security Policy</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-semibold text-emerald-400">Enforced & Audited</span>
              <span className="text-[10px] text-[#64748b] font-mono">v2.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Access Dashboard Sub-tabs */}
      <div className="flex items-center justify-between border-b border-[#1c222b] pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeSubTab === 'users'
                ? 'bg-[#181d28] text-white border border-[#2b3548] shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Team Members & Custom Access</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21293a] text-slate-300">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeSubTab === 'matrix'
                ? 'bg-[#181d28] text-white border border-[#2b3548] shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Role Permissions Matrix</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21293a] text-slate-300">
              {roles.length} Roles
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeSubTab === 'simulator'
                ? 'bg-[#181d28] text-white border border-[#2b3548] shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role Tester & Preview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeSubTab === 'audit'
                ? 'bg-[#181d28] text-white border border-[#2b3548] shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Access Audit Log</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21293a] text-slate-300">
              {accessLogs.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'matrix' && (
          <button
            onClick={() => setIsNewRoleModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#141b27] hover:bg-[#1c2536] text-sky-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      {/* TAB 1: TEAM MEMBERS & PERSON-LEVEL ACCESS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-[#0b0e14] border border-[#1b222f]">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name, email, or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121620] border border-[#1f2736] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-hidden focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Department Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#64748b] hidden sm:inline">Dept:</span>
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="bg-[#121620] border border-[#1f2736] text-xs text-[#cbd5e1] rounded-lg px-2.5 py-2 focus:outline-hidden"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#64748b] hidden sm:inline">Role:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-[#121620] border border-[#1f2736] text-xs text-[#cbd5e1] rounded-lg px-2.5 py-2 focus:outline-hidden"
                >
                  <option value="All">All Roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Override Filter */}
              <select
                value={overrideFilter}
                onChange={e => setOverrideFilter(e.target.value as any)}
                className="bg-[#121620] border border-[#1f2736] text-xs text-[#cbd5e1] rounded-lg px-2.5 py-2 focus:outline-hidden"
              >
                <option value="All">All Permission Types</option>
                <option value="custom">Custom Overridden Only</option>
                <option value="default">Standard Role Defaults</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-xl border border-[#1b222f] bg-[#0a0d13] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f141d] border-b border-[#1b2331] text-[#94a3b8] font-medium uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Member Name & Email</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Department & Shift</th>
                    <th className="py-3.5 px-4">Access Mode (ব্যক্তিগত এক্সেস)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161d2a]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#64748b]">
                        No team members found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const roleDef = roles.find(r => r.id === u.roleId) || roles[0];
                      const isCurrentActive = currentUser.id === u.id;
                      const hasCustom = Boolean(u.useCustomPermissions);
                      const customCount = u.customPermissions ? Object.keys(u.customPermissions).length : 0;

                      return (
                        <tr 
                          key={u.id}
                          className={`hover:bg-[#121722]/80 transition-colors ${
                            isCurrentActive ? 'bg-[#131b28]/50' : ''
                          }`}
                        >
                          {/* Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white text-xs">
                                  {u.avatarText}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0d13] ${
                                  u.isClockedIn ? 'bg-emerald-500' : 'bg-neutral-600'
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate">{u.name}</span>
                                  {isCurrentActive && (
                                    <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#64748b] truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs border ${roleDef.badgeColor} ${roleDef.badgeBg}`}>
                              <Shield className="w-3 h-3" />
                              <span>{roleDef.name}</span>
                            </span>
                          </td>

                          {/* Department & Shift */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="text-[#cbd5e1] font-medium">{u.department}</p>
                              <p className="text-[11px] text-[#64748b]">{u.shift}</p>
                            </div>
                          </td>

                          {/* Access Mode */}
                          <td className="py-3.5 px-4">
                            {hasCustom ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                                <Sliders className="w-3 h-3 text-amber-400" />
                                <span>Custom Overrides ({customCount} rules)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#161c27] text-[#94a3b8] text-[11px]">
                                <Shield className="w-3 h-3 text-[#64748b]" />
                                <span>Inherited from Role</span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Active</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Configure Access Button */}
                              <button
                                onClick={() => handleOpenConfigureAccess(u)}
                                className="px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-amber-500/20 text-[#cbd5e1] hover:text-amber-300 border border-[#212b3d] hover:border-amber-500/40 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                title="Configure granular access for this specific person"
                              >
                                <Key className="w-3 h-3 text-amber-400" />
                                <span>Configure Access</span>
                              </button>

                              {/* Edit Profile & Role Button */}
                              <button
                                onClick={() => handleOpenEditUserModal(u)}
                                className="px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-sky-500/20 text-[#cbd5e1] hover:text-sky-300 border border-[#212b3d] hover:border-sky-500/40 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                title="Edit user profile details and role"
                              >
                                <Edit3 className="w-3 h-3 text-sky-400" />
                                <span>Edit</span>
                              </button>

                              {/* Simulate / Switch User */}
                              <button
                                onClick={() => setCurrentUserId(u.id)}
                                disabled={isCurrentActive}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                                  isCurrentActive
                                    ? 'bg-[#151d29] text-[#64748b] cursor-default'
                                    : 'bg-[#141d2a] hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer active:scale-95'
                                }`}
                                title={isCurrentActive ? 'Currently active identity' : 'Switch active portal session to this user'}
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span>{isCurrentActive ? 'Active' : 'Log in as'}</span>
                              </button>

                              {/* Delete button (prevent deleting only admin) */}
                              {u.roleId !== 'admin' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                      deleteUser(u.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSION MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0d1118] border border-[#1b222f] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Standard Role Baseline Matrix</span>
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Changes made here immediately affect all members assigned to each role (unless a member has custom person-specific overrides enabled).
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Allowed
              </span>
              <span className="text-[#475569]">|</span>
              <span className="flex items-center gap-1 text-[#64748b]">
                <X className="w-3.5 h-3.5" /> Restricted
              </span>
            </div>
          </div>

          {/* Big Matrix Grid Table */}
          <div className="rounded-xl border border-[#1b222f] bg-[#090c12] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0e131c] border-b border-[#1b2331]">
                    <th className="py-3 px-4 min-w-[240px] text-[#94a3b8] font-bold text-xs uppercase tracking-wider sticky left-0 bg-[#0e131c] z-20">
                      Permission Module & Action
                    </th>
                    {roles.map(r => (
                      <th key={r.id} className="py-3 px-3 text-center min-w-[130px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${r.badgeColor} ${r.badgeBg}`}>
                            {r.name}
                          </span>
                          <span className="text-[10px] text-[#64748b] font-mono">
                            {users.filter(u => u.roleId === r.id).length} users
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151c27]">
                  {PERMISSION_CATEGORIES.map(category => (
                    <React.Fragment key={category.title}>
                      {/* Category Header Row */}
                      <tr className="bg-[#111722]/90 border-t border-[#1e2738]">
                        <td 
                          colSpan={roles.length + 1} 
                          className="py-2.5 px-4 font-bold text-white text-[11px] tracking-wide uppercase bg-[#111722] sticky left-0 z-10"
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.title}</span>
                            <span className="text-[10px] text-[#64748b] font-normal lowercase">{category.description}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {category.permissions.map(perm => (
                        <tr key={perm.key} className="hover:bg-[#121824] transition-colors">
                          <td className="py-2.5 px-4 sticky left-0 bg-[#090c12] z-10 border-r border-[#171f2c]">
                            <p className="font-semibold text-white">{perm.label}</p>
                            <p className="text-[10px] text-[#64748b] truncate max-w-xs">{perm.description}</p>
                          </td>

                          {roles.map(r => {
                            const isGranted = Boolean(r.permissions[perm.key]);
                            const isSystemAdminLock = r.id === 'admin' && perm.key === 'manage_access';

                            return (
                              <td key={r.id} className="py-2 px-3 text-center">
                                <button
                                  onClick={() => handleToggleRolePermission(r.id, perm.key)}
                                  disabled={isSystemAdminLock}
                                  className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${
                                    isGranted
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-[#121620] text-[#475569] border border-[#1c2331] hover:text-[#94a3b8]'
                                  } ${isSystemAdminLock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
                                  title={`${r.name}: Click to ${isGranted ? 'Revoke' : 'Grant'} ${perm.label}`}
                                >
                                  {isGranted ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULATOR & PREVIEW */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#0d1118] border border-[#1b222f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Interactive Access Simulator</span>
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Select any team member or role to inspect exactly what sidebar links they will see, what forms they can submit, and test the portal as them.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#64748b]">Select User:</span>
              <select
                value={simulatorTargetId}
                onChange={e => setSimulatorTargetId(e.target.value)}
                className="bg-[#121620] border border-[#1f2736] text-xs text-white rounded-lg px-3 py-2 font-medium focus:outline-hidden"
              >
                {users.map(u => {
                  const r = roles.find(ro => ro.id === u.roleId);
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({r?.name || u.roleId}) {u.useCustomPermissions ? '• Custom' : ''}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={() => setCurrentUserId(simulatorTargetId)}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Simulate / Log In As</span>
              </button>
            </div>
          </div>

          {/* Simulator Results Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Simulated Profile */}
            <div className="p-5 rounded-xl bg-[#0b0e14] border border-[#1c2433] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-emerald-600 to-teal-400 text-white font-black text-sm flex items-center justify-center shadow-lg">
                  {simulatorUser.avatarText}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{simulatorUser.name}</h3>
                  <p className="text-xs text-[#64748b]">{simulatorUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${simulatorRole.badgeColor} ${simulatorRole.badgeBg}`}>
                    {simulatorRole.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#171f2c] text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#64748b]">Department:</span>
                  <span className="text-white font-medium">{simulatorUser.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748b]">Shift:</span>
                  <span className="text-white font-medium">{simulatorUser.shift}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748b]">Permission Mode:</span>
                  <span className={`font-semibold ${simulatorUser.useCustomPermissions ? 'text-amber-400' : 'text-slate-300'}`}>
                    {simulatorUser.useCustomPermissions ? 'Custom Person Overrides' : 'Standard Role Defaults'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenConfigureAccess(simulatorUser)}
                  className="w-full py-2 rounded-lg bg-[#141b27] hover:bg-amber-500/20 text-[#cbd5e1] hover:text-amber-300 border border-[#212b3d] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customize This Person's Access</span>
                </button>
              </div>
            </div>

            {/* Middle Card: Visible Navigation Tabs */}
            <div className="p-5 rounded-xl bg-[#0b0e14] border border-[#1c2433] space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94a3b8] flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Simulated Sidebar Visibility</span>
              </h3>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {[
                  { tab: 'overview', key: 'view_overview', label: 'Overview Dashboard' },
                  { tab: 'queue', key: 'view_queue', label: 'Queue Management' },
                  { tab: 'updates', key: 'view_updates', label: 'Update Sheet' },
                  { tab: 'issues', key: 'view_issues', label: 'Issue Sheet' },
                  { tab: 'stations', key: 'view_stations', label: 'Station & Shifts' },
                  { tab: 'complains', key: 'view_complains', label: 'Complains Hub' },
                  { tab: 'stores', key: 'view_stores', label: 'Store Matrix' },
                  { tab: 'handover', key: 'view_handover', label: 'Daily Handover' },
                  { tab: 'access', key: 'manage_access', label: 'Access Control Dashboard' }
                ].map(item => {
                  const allowed = hasPermission(item.key as PermissionKey, simulatorUser);
                  return (
                    <div 
                      key={item.key}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        allowed 
                          ? 'bg-[#101724] border border-emerald-500/30 text-white' 
                          : 'bg-[#090c10] border border-[#171d27] text-[#475569]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {allowed ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-[#475569]" />
                        )}
                        <span className={allowed ? 'font-medium' : 'line-through'}>
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        allowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {allowed ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Authorized Key Operations */}
            <div className="p-5 rounded-xl bg-[#0b0e14] border border-[#1c2433] space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#94a3b8] flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Authorized Actions & Rights</span>
              </h3>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {[
                  { key: 'create_queue', label: 'Can Create Queue Items' },
                  { key: 'process_queue', label: 'Can Give Post-Sales Update' },
                  { key: 'create_updates', label: 'Can Add Update Entries' },
                  { key: 'edit_updates', label: 'Can Edit Update Entries' },
                  { key: 'delete_updates', label: 'Can Delete Update Entries' },
                  { key: 'approve_updates', label: 'Can Perform TL Check' },
                  { key: 'send_updates', label: 'Can Mark as Sent (Done)' },
                  { key: 'reopen_updates', label: 'Can Reopen Archived Updates' },
                  { key: 'export_updates', label: 'Can Export Sheet CSV' },
                  { key: 'view_completed_updates', label: 'Can View Done Tab' },
                  { key: 'view_message_details', label: 'Can View Message Details' },
                  { key: 'manage_stations', label: 'Can Manage Shift Stations' },
                  { key: 'resolve_complains', label: 'Can Resolve Complaints' },
                  { key: 'manage_stores', label: 'Can Edit Store Matrix' },
                  { key: 'export_data', label: 'Can Export System Reports' },
                  { key: 'delete_records', label: 'Can Delete Records' }
                ].map(act => {
                  const allowed = hasPermission(act.key as PermissionKey, simulatorUser);
                  return (
                    <div 
                      key={act.key}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        allowed 
                          ? 'bg-[#101724] border border-[#1d2739] text-[#cbd5e1]' 
                          : 'bg-[#090c10] border border-[#151922] text-[#475569]'
                      }`}
                    >
                      <span>{act.label}</span>
                      {allowed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#475569] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCESS AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0d1118] border border-[#1b222f] flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Security & Permission Activity Log</span>
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Chronological record of role updates, person-wise overrides, and new accounts.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#1b222f] bg-[#0a0d13] overflow-hidden shadow-lg">
            <div className="divide-y divide-[#161d2a]">
              {accessLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[#121722]/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                      <Key className="w-4 h-4" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{log.targetName}</span>
                        <span className="text-[10px] font-mono bg-[#171f2d] text-[#94a3b8] px-1.5 py-0.2 rounded border border-[#232e42]">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-[#cbd5e1]">{log.details}</p>
                      <p className="text-[11px] text-[#64748b]">
                        Triggered by <span className="text-white font-medium">{log.actorName}</span> ({log.actorRole})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#64748b] font-mono shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIGURE CUSTOM ACCESS FOR A SPECIFIC PERSON */}
      {editingUserPermissions && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0b0e14] border border-[#212b3c] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#1c2433] flex items-center justify-between bg-[#0e131d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-yellow-400 text-black font-extrabold text-sm flex items-center justify-center shadow-md">
                  {editingUserPermissions.avatarText}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Configure Access: {editingUserPermissions.name}
                  </h3>
                  <p className="text-xs text-[#94a3b8]">
                    Role: <span className="text-amber-400 font-semibold">{roles.find(r => r.id === editingUserPermissions.roleId)?.name}</span> • {editingUserPermissions.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingUserPermissions(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Person-Level Override Toggle Banner */}
              <div className="p-4 rounded-xl bg-[#111723] border border-[#212c3f] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Use Person-Specific Permissions (ব্যক্তিগত কাস্টম অনুমতি)</span>
                    </h4>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      When enabled, this person will have unique custom permissions instead of strictly following their role's preset.
                    </p>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !useCustomDraft;
                      setUseCustomDraft(next);
                      if (!next) {
                        // Re-seed from role defaults
                        const roleDef = roles.find(r => r.id === editingUserPermissions.roleId) || roles[0];
                        setCustomPermsDraft({ ...roleDef.permissions });
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      useCustomDraft ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        useCustomDraft ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {!useCustomDraft && (
                  <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-sky-400" />
                    <span>Currently inheriting all baseline permissions from role: <strong>{roles.find(r => r.id === editingUserPermissions.roleId)?.name}</strong>. Toggle above to customize individual checkboxes.</span>
                  </div>
                )}
              </div>

              {/* Granular Checkbox Sections */}
              <div className={`space-y-6 transition-opacity ${!useCustomDraft ? 'opacity-60 pointer-events-none' : ''}`}>
                {PERMISSION_CATEGORIES.map(category => (
                  <div key={category.title} className="space-y-3">
                    <div className="border-b border-[#1c2433] pb-1.5 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {category.title}
                      </h4>
                      <span className="text-[10px] text-[#64748b]">{category.description}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {category.permissions.map(perm => {
                        const checked = Boolean(customPermsDraft[perm.key]);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              checked
                                ? 'bg-[#121926] border-amber-500/40 text-white'
                                : 'bg-[#0e1219] border-[#1c2331] text-[#94a3b8] hover:border-[#2b3548]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                setCustomPermsDraft(prev => ({
                                  ...prev,
                                  [perm.key]: e.target.checked
                                }));
                              }}
                              className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold leading-snug">{perm.label}</p>
                              <p className="text-[11px] text-[#64748b] leading-tight mt-0.5">{perm.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-[#1c2433] bg-[#0e131d] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleResetToRoleDefaults(editingUserPermissions.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#1a2230] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Role Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserPermissions(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#1a2230]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserPermissions}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Access Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW TEAM MEMBER (WITH ROLE AUTO-ACCESS & OPTIONAL CUSTOM OVERRIDES) */}
      {isAddUserModalOpen && (() => {
        const selectedAddRole = roles.find(r => r.id === newUserForm.roleId) || roles[0];
        const autoGrantedCount = Object.values(selectedAddRole.permissions).filter(Boolean).length;
        const totalPermsCount = Object.keys(selectedAddRole.permissions).length;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <form 
              onSubmit={handleCreateUserSubmit} 
              className="bg-[#0b0e14] border border-[#212b3c] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#1c2433] flex items-center justify-between bg-[#0e131d] shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <UserPlus className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm">Add New Team Member</h3>
                    <p className="text-[11px] text-[#94a3b8]">Select a role to automatically assign all access permissions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-1 rounded-lg text-[#64748b] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Basic Info: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Samiul Ajom"
                      value={newUserForm.name}
                      onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                      Work Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="samiul@scaleup.com"
                      value={newUserForm.email}
                      onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* ROLE SELECTION & AUTO-ACCESS CARD */}
                <div className="p-4 rounded-xl bg-[#0f1420] border border-[#223049] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Portal Role (রোল নির্বাচন করুন)</span>
                      </label>
                      <p className="text-[11px] text-[#94a3b8]">
                        Choose from the 7 standard portal roles to auto-assign all permissions
                      </p>
                    </div>

                    <span className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-md font-semibold border ${selectedAddRole.badgeColor} ${selectedAddRole.badgeBg}`}>
                      {selectedAddRole.name}
                    </span>
                  </div>

                  {/* Role Dropdown */}
                  <select
                    value={newUserForm.roleId}
                    onChange={e => handleRoleSelectInAddUser(e.target.value)}
                    className="w-full bg-[#131a29] border border-[#283852] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500/70 font-semibold cursor-pointer shadow-inner"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id} className="bg-[#0b0e14] py-1">
                        {r.name} — ({r.description.slice(0, 55)}...)
                      </option>
                    ))}
                  </select>

                  {/* Auto-Inherited Permissions Summary Banner */}
                  <div className="p-3 rounded-lg bg-[#0b0f17] border border-[#1e293c] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Auto-Inherited Access Active ({autoGrantedCount}/{totalPermsCount} Allowed)</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64748b]">Zero Manual Setup Needed</span>
                    </div>

                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                      {selectedAddRole.description}
                    </p>

                    {/* Quick Access Badges for this Role */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="text-[#64748b]">Key features:</span>
                      {selectedAddRole.permissions.overview_view_kpi && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Overview KPI
                        </span>
                      )}
                      {selectedAddRole.permissions.overview_view_operations_wip && (
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          Operations WIP Matrix
                        </span>
                      )}
                      {selectedAddRole.permissions.overview_view_sales_updates && (
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          Sales Updates
                        </span>
                      )}
                      {selectedAddRole.permissions.approve_updates ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                          TL Check: Allowed ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          TL Check: Restricted ✕
                        </span>
                      )}
                      {selectedAddRole.permissions.view_updates && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Update Sheet
                        </span>
                      )}
                      {selectedAddRole.permissions.view_issues && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Issue Sheet
                        </span>
                      )}
                      {selectedAddRole.permissions.view_queue && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Queue
                        </span>
                      )}
                      {selectedAddRole.permissions.view_stations && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Stations
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#38bdf8] bg-sky-500/10 border border-sky-500/20 rounded-md p-2 flex items-center gap-2 mt-1">
                      <Info className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                      <span>
                        এই রোলটি সিলেক্ট করায় মেম্বার স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট সব ফিচার ও ওভারভিউয়ের অ্যাক্সেস পেয়ে যাবে।
                      </span>
                    </div>
                  </div>
                </div>

                {/* INDIVIDUAL CUSTOM PERMISSIONS OVERRIDE TOGGLE */}
                <div className="p-4 rounded-xl bg-[#0f141f] border border-[#1e2738] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">
                          Customize Individual Permissions (ঐচ্ছিক আলাদা কনফিগারেশন)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94a3b8]">
                        Keep OFF to automatically inherit role access. Turn ON only to override specific permissions for this person.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !newUserUseCustomPermissions;
                        setNewUserUseCustomPermissions(nextVal);
                        if (nextVal) {
                          const roleDef = roles.find(r => r.id === newUserForm.roleId) || roles[0];
                          setNewUserCustomPerms({ ...roleDef.permissions });
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        newUserUseCustomPermissions ? 'bg-amber-500' : 'bg-[#242f42]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          newUserUseCustomPermissions ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expandable Granular Permission Checkboxes */}
                  {newUserUseCustomPermissions && (
                    <div className="pt-3 border-t border-[#1e293b] space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-300">
                          Individual Overrides Active for this Person
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const roleDef = roles.find(r => r.id === newUserForm.roleId) || roles[0];
                              setNewUserCustomPerms({ ...roleDef.permissions });
                            }}
                            className="px-2 py-0.5 rounded bg-[#182030] hover:bg-[#202b40] text-[10px] font-medium text-[#cbd5e1] border border-[#2b3952] cursor-pointer"
                          >
                            Reset to {selectedAddRole.name} Defaults
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {PERMISSION_CATEGORIES.map(category => (
                          <div key={category.title} className="p-2.5 rounded-lg bg-[#090d14] border border-[#1b2333] space-y-2">
                            <h4 className="text-[11px] font-bold text-white flex items-center justify-between">
                              <span>{category.title}</span>
                              <span className="text-[10px] font-mono text-[#64748b]">
                                {category.permissions.filter(p => newUserCustomPerms[p.key]).length}/{category.permissions.length}
                              </span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {category.permissions.map(perm => {
                                const isChecked = Boolean(newUserCustomPerms[perm.key]);
                                return (
                                  <label
                                    key={perm.key}
                                    className={`flex items-start gap-2 p-1.5 rounded-md border text-[11px] cursor-pointer transition-colors ${
                                      isChecked 
                                        ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                                        : 'bg-[#10141d] border-[#1c2434] text-[#94a3b8]'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={e => {
                                        setNewUserCustomPerms(prev => ({
                                          ...prev,
                                          [perm.key]: e.target.checked
                                        }));
                                      }}
                                      className="mt-0.5 rounded border-[#2a364a] text-amber-500 focus:ring-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-semibold leading-tight">{perm.label}</p>
                                      <p className="text-[10px] text-[#64748b] leading-tight truncate">{perm.description}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Info: Department, Shift, Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Department</label>
                    <select
                      value={newUserForm.department}
                      onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                      className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Management">Management</option>
                      <option value="Post-Sales">Post-Sales</option>
                      <option value="Shopify Dev">Shopify Dev</option>
                      <option value="Quality">Quality</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Assigned Shift</label>
                    <select
                      value={newUserForm.shift}
                      onChange={e => setNewUserForm({ ...newUserForm, shift: e.target.value })}
                      className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                    >
                      <option value="Morning Shift">Morning Shift (07 AM - 03 PM)</option>
                      <option value="Evening Shift">Evening Shift (03 PM - 11 PM)</option>
                      <option value="Night Shift">Night Shift (11 PM - 07 AM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={newUserForm.phoneWhatsapp}
                      onChange={e => setNewUserForm({ ...newUserForm, phoneWhatsapp: e.target.value })}
                      className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#1c2433] bg-[#0e131d] flex items-center justify-between gap-2 shrink-0">
                <div className="text-[11px] text-[#64748b]">
                  {newUserUseCustomPermissions ? (
                    <span className="text-amber-400 font-medium">Mode: Custom overrides active</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Mode: Auto-inherited {selectedAddRole.name} access</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Create Member
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      })()}

      {/* MODAL 3: EDIT EXISTING MEMBER PROFILE & ROLE */}
      {editingUserDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <form 
            onSubmit={handleSaveEditUserSubmit} 
            className="bg-[#0b0e14] border border-[#212b3c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
          >
            <div className="p-5 border-b border-[#1c2433] flex items-center justify-between bg-[#0e131d]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Edit3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">Edit Member Details & Role</h3>
                  <p className="text-[11px] text-[#94a3b8]">Modify user information or change their portal role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUserDetails(null)}
                className="p-1 rounded-lg text-[#64748b] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUserEditForm.name}
                  onChange={e => setEditingUserEditForm({ ...editingUserEditForm, name: e.target.value })}
                  className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={editingUserEditForm.email}
                  onChange={e => setEditingUserEditForm({ ...editingUserEditForm, email: e.target.value })}
                  className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
                />
              </div>

              {/* ROLE SELECTION */}
              <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#1f2d42] space-y-2">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Portal Role (রোল পরিবর্তন করুন)</span>
                </label>
                <select
                  value={editingUserEditForm.roleId}
                  onChange={e => setEditingUserEditForm({ ...editingUserEditForm, roleId: e.target.value })}
                  className="w-full bg-[#131b29] border border-[#23324a] rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-hidden focus:border-sky-500/60"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#94a3b8]">
                  Changing the role immediately applies the new role baseline to this member.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Department</label>
                  <select
                    value={editingUserEditForm.department}
                    onChange={e => setEditingUserEditForm({ ...editingUserEditForm, department: e.target.value })}
                    className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Management">Management</option>
                    <option value="Post-Sales">Post-Sales</option>
                    <option value="Shopify Dev">Shopify Dev</option>
                    <option value="Quality">Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Status</label>
                  <select
                    value={editingUserEditForm.status}
                    onChange={e => setEditingUserEditForm({ ...editingUserEditForm, status: e.target.value as any })}
                    className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Assigned Shift</label>
                  <select
                    value={editingUserEditForm.shift}
                    onChange={e => setEditingUserEditForm({ ...editingUserEditForm, shift: e.target.value })}
                    className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="Morning Shift">Morning Shift (07 AM - 03 PM)</option>
                    <option value="Evening Shift">Evening Shift (03 PM - 11 PM)</option>
                    <option value="Night Shift">Night Shift (11 PM - 07 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingUserEditForm.phoneWhatsapp}
                    onChange={e => setEditingUserEditForm({ ...editingUserEditForm, phoneWhatsapp: e.target.value })}
                    className="w-full bg-[#121620] border border-[#1f2736] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1c2433] bg-[#0e131d] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUserDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATE CUSTOM ROLE */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleCreateRoleSubmit} className="bg-[#0b0e14] border border-[#212b3c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-[#1c2433] flex items-center justify-between bg-[#0e131d]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-white text-sm">Create New Role Preset</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(false)}
                className="p-1 rounded-lg text-[#64748b] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1] mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Night Supervisor, Senior Auditor"
                  value={newRoleForm.name}
                  onChange={e => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full bg-[#121620] border border-[#1f2736] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cbd5e1] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the department responsibilities for this role..."
                  value={newRoleForm.description}
                  onChange={e => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full bg-[#121620] border border-[#1f2736] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cbd5e1] mb-1">Badge Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30', label: 'Indigo' },
                    { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', label: 'Rose' },
                    { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', label: 'Cyan' },
                    { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Emerald' }
                  ].map(theme => (
                    <button
                      key={theme.label}
                      type="button"
                      onClick={() => setNewRoleForm({
                        ...newRoleForm,
                        badgeColor: theme.color,
                        badgeBg: theme.bg
                      })}
                      className={`p-2 rounded-lg text-xs font-semibold border text-center transition-all ${theme.color} ${theme.bg} ${
                        newRoleForm.badgeColor === theme.color ? 'ring-2 ring-white/40' : 'opacity-70'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1c2433] bg-[#0e131d] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Create Role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
