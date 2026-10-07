import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Plus, 
  Download, 
  Edit3, 
  Eye, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Search, 
  Check, 
  CheckCircle2, 
  Trash2, 
  BarChart3, 
  Users, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Sparkles, 
  AlertCircle,
  Paperclip,
  ExternalLink,
  Copy
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { IssueItem, IssueStatus, ServiceType, TeamType, RiskLevel, AttachmentUrlItem } from '../../types';
import { EditIssueView } from './EditIssueView';
import { AttachmentHubModal } from './AttachmentHubModal';

// Exact team list from user screenshot
export const AVAILABLE_TEAMS: TeamType[] = [
  'Shopify_Zen',
  'WP_Titans',
  'NextGen_WP',
  'WP Knight_Riders',
  'WIX_Spark',
  'Shopi_Day',
  'Webflow',
  'Square Space'
];

// Available service lines
export const AVAILABLE_SERVICES: ServiceType[] = [
  'CMS',
  'Shopify',
  'WordPress',
  'Wix',
  'Webflow',
  'Square Space',
  'SEO',
  'Design'
];

export const IssueSheetView: React.FC = () => {
  const { 
    issues, 
    addIssue, 
    updateIssue, 
    deleteIssue, 
    deleteMultipleIssues,
    deleteAllDoneIssues,
    completeIssue, 
    reopenIssue, 
    issueTeamFilter,
    setIssueTeamFilter,
    user 
  } = usePortal();

  // Active view tab: 'active' (default, excludes done), 'resolved' (only done), 'all'
  const [viewTab, setViewTab] = useState<'active' | 'resolved' | 'all'>('active');

  // Filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Multi-select for bulk delete
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [isDeleteAllDoneModalOpen, setIsDeleteAllDoneModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<IssueItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Dropdown open states for inline row menus
  const [openTeamDropdownId, setOpenTeamDropdownId] = useState<string | null>(null);
  const [openServiceDropdownId, setOpenServiceDropdownId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueItem | null>(null);
  const [viewingIssue, setViewingIssue] = useState<IssueItem | null>(null);
  const [attachmentHubIssue, setAttachmentHubIssue] = useState<IssueItem | null>(null);

  // RESOLUTION MESSAGE BOX MODAL (The user's key requirement)
  const [resolvingIssue, setResolvingIssue] = useState<IssueItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [logToUpdateSheet, setLogToUpdateSheet] = useState(true);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Issue Form State
  const [formData, setFormData] = useState<{
    profile: string;
    clientName: string;
    orderId: string;
    service: ServiceType;
    team: TeamType;
    specialNotes: string;
    orderPageUrl: string;
    inboxPageUrl: string;
    fileMeetingLink: string;
    assignedPerson: string;
    riskLevel: RiskLevel;
    salesNote: string;
    attachmentUrls: AttachmentUrlItem[];
    status: IssueStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    profile: 'ecom_store3_Fiverr',
    clientName: '',
    orderId: '',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: '',
    orderPageUrl: '',
    inboxPageUrl: '',
    fileMeetingLink: '',
    assignedPerson: '',
    riskLevel: 'Low',
    salesNote: '',
    attachmentUrls: [],
    status: 'open',
    priority: 'medium'
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.team-dropdown-container') && !target.closest('.service-dropdown-container')) {
        setOpenTeamDropdownId(null);
        setOpenServiceDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedIssueIds([]);
  }, [viewTab]);

  // Extract unique profiles for filter dropdown
  const uniqueProfiles = useMemo(() => {
    return Array.from(new Set(issues.map(i => i.profile)));
  }, [issues]);

  // Counts
  const activeCount = useMemo(() => issues.filter(i => i.status !== 'done').length, [issues]);
  const resolvedCount = useMemo(() => issues.filter(i => i.status === 'done').length, [issues]);

  // Filtered issues based on viewTab & filters
  const filteredIssues = useMemo(() => {
    return issues.filter(item => {
      // Tab filter
      if (viewTab === 'active' && item.status === 'done') return false;
      if (viewTab === 'resolved' && item.status !== 'done') return false;

      const matchesSearch = 
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.specialNotes && item.specialNotes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.resolutionNote && item.resolutionNote.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProfile = profileFilter === 'All' || item.profile === profileFilter;
      const matchesService = serviceFilter === 'All' || item.service === serviceFilter;
      const matchesTeam = issueTeamFilter === 'All' || item.team === issueTeamFilter;
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

      return matchesSearch && matchesProfile && matchesService && matchesTeam && matchesPriority;
    });
  }, [issues, viewTab, searchQuery, profileFilter, serviceFilter, issueTeamFilter, priorityFilter]);

  // Paginated items
  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIssues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIssues, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / itemsPerPage));

  // Multi-select handlers
  const isAllOnPageSelected = useMemo(() => {
    if (paginatedIssues.length === 0) return false;
    return paginatedIssues.every(item => selectedIssueIds.includes(item.id));
  }, [paginatedIssues, selectedIssueIds]);

  const handleToggleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      // Deselect page items
      const pageIds = new Set(paginatedIssues.map(i => i.id));
      setSelectedIssueIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      // Select page items
      const pageIds = paginatedIssues.map(i => i.id);
      setSelectedIssueIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIssueIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected
  const handleDeleteSelected = () => {
    if (selectedIssueIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  // Delete All Done Issues
  const handleConfirmDeleteAllDone = () => {
    const count = resolvedCount;
    deleteAllDoneIssues();
    setIsDeleteAllDoneModalOpen(false);
    setSelectedIssueIds([]);
    setToastMessage(`✓ All ${count} completed issue(s) have been deleted.`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Profile', 'Client Name', 'Service', 'Team', 'Special Notes', 'Status', 'Resolution Work Log', 'Order Page', 'Inbox Page'];
    const rows = filteredIssues.map(i => [
      `"${i.date}"`,
      `"${i.profile}"`,
      `"${i.clientName}"`,
      `"${i.service}"`,
      `"${i.team}"`,
      `"${(i.specialNotes || '').replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${(i.resolutionNote || '').replace(/"/g, '""')}"`,
      `"${i.orderPageUrl || ''}"`,
      `"${i.inboxPageUrl || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `issue_sheet_${viewTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Status Change Interceptor
  const handleInitiateStatusChange = (item: IssueItem, newStatus: IssueStatus) => {
    if (newStatus === 'done' && item.status !== 'done') {
      // Trigger resolution message box modal!
      setResolvingIssue(item);
      setResolutionText(item.resolutionNote || '');
    } else {
      updateIssue(item.id, { status: newStatus });
      setToastMessage(`Status for ${item.clientName} updated to "${newStatus}".`);
    }
  };

  // Submit Resolution & Remove Issue from Active View
  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;
    if (!resolutionText.trim()) {
      setToastMessage('অনুগ্রহ করে কি কাজ করেছেন তা সংক্ষেপে লিখুন।');
      return;
    }

    const clientName = resolvingIssue.clientName;
    completeIssue(resolvingIssue.id, resolutionText.trim(), logToUpdateSheet);

    setResolvingIssue(null);
    setResolutionText('');
    setToastMessage(`✓ Issue for "${clientName}" marked as Done and removed from active sheet!`);
  };

  // Reopen resolved issue
  const handleReopen = (item: IssueItem) => {
    reopenIssue(item.id);
    setToastMessage(`Issue for "${item.clientName}" reopened and returned to active sheet.`);
  };

  // Service Badge Color Helper
  const getServiceBadgeStyle = (service: string) => {
    switch (service.toLowerCase()) {
      case 'cms':
        return 'bg-[#7c3aed] text-white';
      case 'shopify':
        return 'bg-[#059669] text-white';
      case 'wordpress':
      case 'wp':
        return 'bg-[#0284c7] text-white';
      case 'wix':
        return 'bg-[#d97706] text-white';
      case 'webflow':
        return 'bg-[#2563eb] text-white';
      case 'square space':
      case 'squarespace':
        return 'bg-[#475569] text-white';
      case 'seo':
        return 'bg-[#0d9488] text-white';
      case 'design':
        return 'bg-[#ea580c] text-white';
      default:
        return 'bg-[#7c3aed] text-white';
    }
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim()) return;

    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const cleanedAttachments = formData.attachmentUrls.filter(a => a.url.trim() !== '');

    addIssue({
      date: dateStr,
      profile: formData.profile,
      clientName: formData.clientName.trim(),
      orderId: formData.orderId.trim(),
      service: formData.service,
      team: formData.team,
      specialNotes: formData.specialNotes.trim(),
      orderPageUrl: formData.orderPageUrl.trim(),
      inboxPageUrl: formData.inboxPageUrl.trim(),
      fileMeetingLink: formData.fileMeetingLink.trim(),
      assignedPerson: formData.assignedPerson.trim(),
      riskLevel: formData.riskLevel,
      salesNote: formData.salesNote.trim(),
      attachmentUrls: cleanedAttachments,
      status: formData.status,
      priority: formData.priority,
      reportedBy: user.name
    });

    setFormData({
      profile: 'ecom_store3_Fiverr',
      clientName: '',
      orderId: '',
      service: 'CMS',
      team: 'Shopi_Day',
      specialNotes: '',
      orderPageUrl: '',
      inboxPageUrl: '',
      fileMeetingLink: '',
      assignedPerson: '',
      riskLevel: 'Low',
      salesNote: '',
      attachmentUrls: [],
      status: 'open',
      priority: 'medium'
    });
    setIsAddModalOpen(false);
    setToastMessage('New issue created successfully.');
  };

  // Dedicated Edit Issue Screen (Matching User's Uploaded Screenshot)
  if (editingIssue) {
    return (
      <div className="animate-fadeIn relative">
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 bg-[#14261d] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slideIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <EditIssueView
          issue={editingIssue}
          availableProfiles={uniqueProfiles}
          onBack={() => setEditingIssue(null)}
          onSave={(updated) => {
            updateIssue(updated.id, updated);
            setEditingIssue(null);
            setToastMessage(`✓ Issue for "${updated.clientName}" updated successfully.`);
          }}
          onDelete={(id) => {
            deleteIssue(id);
            setEditingIssue(null);
            setToastMessage('✓ Issue deleted successfully.');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#14261d] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slideIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header section matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Issue Sheet</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Monitor sales issues and their resolution. Use filters to quickly track progress and status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all ${
              isFilterOpen || profileFilter !== 'All' || serviceFilter !== 'All' || issueTeamFilter !== 'All'
                ? 'bg-[#1e1c12] border-amber-500/60 text-amber-300'
                : 'bg-[#11141c] border-[#1e2531] text-neutral-300 hover:text-white hover:bg-[#171c26]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(profileFilter !== 'All' || serviceFilter !== 'All' || issueTeamFilter !== 'All') && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#11141c] border border-[#1e2531] text-neutral-300 hover:text-white hover:bg-[#171c26] flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Issue</span>
          </button>
        </div>
      </div>

      {/* View Tabs: Active Issues (Default), Resolved History, All Issues */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a212c] pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setViewTab('active'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewTab === 'active'
                ? 'bg-[#1e1c12] text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <span>Active Issues</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => { setViewTab('resolved'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewTab === 'resolved'
                ? 'bg-[#12281a] text-emerald-300 border border-emerald-500/50 shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <span>Resolved History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
              {resolvedCount}
            </span>
          </button>

          <button
            onClick={() => { setViewTab('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewTab === 'all'
                ? 'bg-[#161c28] text-white border border-[#27354d]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <span>All Issues</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-300">
              {issues.length}
            </span>
          </button>

          {/* Active Team Filter Indicator Badge from Overview selection */}
          {issueTeamFilter !== 'All' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1c12] border border-amber-500/60 text-amber-300 text-xs shadow-xs animate-scaleIn">
              <span>Team: <strong>{issueTeamFilter}</strong></span>
              <button
                onClick={() => { setIssueTeamFilter('All'); setCurrentPage(1); }}
                className="text-amber-400 hover:text-white ml-1 font-bold"
                title="Clear team filter"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. RESOLVED / DONE DELETION ACTIONS (Requested Feature 2)                  */}
        {/* "jegulo done hoise seigulo jeno ami chaile select kore ba all delete o    */}
        {/*  korte pari"                                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2">
          {/* Delete All Done button (Visible when viewing resolved history or when resolved issues exist) */}
          {resolvedCount > 0 && (
            <button
              onClick={() => setIsDeleteAllDoneModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Delete all completed issues permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Done ({resolvedCount})</span>
            </button>
          )}

          {/* Delete Selected Button */}
          {selectedIssueIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm animate-scaleIn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIssueIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating selection banner if items are selected */}
      {selectedIssueIds.length > 0 && (
        <div className="p-3 rounded-xl bg-[#1c1417] border border-red-900/50 flex items-center justify-between text-xs text-neutral-200 animate-slideIn">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-red-400" />
            <span>
              <strong>{selectedIssueIds.length}</strong> issue(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIssueIds([])}
              className="px-3 py-1 rounded bg-[#271d22] hover:bg-[#34242d] text-neutral-300 transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="p-4 rounded-xl bg-[#0e1219] border border-[#1e2736] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b222f]">
            <span className="text-xs font-semibold text-neutral-200">Filter Issue Records</span>
            <button
              onClick={() => {
                setProfileFilter('All');
                setServiceFilter('All');
                setIssueTeamFilter('All');
                setPriorityFilter('All');
                setSearchQuery('');
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Search Keyword</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Client, note, resolution..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Store Profile</label>
              <select
                value={profileFilter}
                onChange={e => setProfileFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Profiles</option>
                {uniqueProfiles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Service Line</label>
              <select
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Services</option>
                {AVAILABLE_SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Team</label>
              <select
                value={issueTeamFilter}
                onChange={e => setIssueTeamFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Teams</option>
                {AVAILABLE_TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table with Selection Checkboxes, Team/Service Dropdowns, and Action Buttons */}
      <div className="bg-[#0b0e13] border border-[#1a212c] rounded-xl overflow-visible shadow-xs">
        <div className="overflow-x-auto min-h-[420px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a212c] text-[#8592a6] bg-[#0d1017]/80 font-medium select-none">
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleToggleSelectAllOnPage}
                    className="w-4 h-4 rounded bg-[#161b24] border-[#273244] text-amber-500 focus:ring-0 cursor-pointer"
                    title="Select / Deselect all on this page"
                  />
                </th>
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-4 font-normal">Profile</th>
                <th className="py-3 px-4 font-normal">Client Name</th>
                <th className="py-3 px-3 font-normal">Service</th>
                <th className="py-3 px-3 font-normal">Team</th>
                <th className="py-3 px-4 font-normal">Special Notes</th>
                <th className="py-3 px-3 font-normal text-center">Order Page</th>
                <th className="py-3 px-3 font-normal text-center">Inbox Page</th>
                <th className="py-3 px-3 font-normal text-center">File/Meeting Link</th>
                <th className="py-3 px-4 font-normal text-center">Status</th>
                <th className="py-3 px-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171d27] text-neutral-300">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-[#64748b]">
                    {viewTab === 'active' ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">All caught up! No active issues remaining.</p>
                        <p className="text-xs text-[#94a3b8]">Click "+ Add Issue" to log a new ticket or switch to "Resolved History" to see completed ones.</p>
                      </div>
                    ) : (
                      'No issues found matching your filters.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedIssues.map(item => {
                  const isTeamOpen = openTeamDropdownId === item.id;
                  const isServiceOpen = openServiceDropdownId === item.id;
                  const isSelected = selectedIssueIds.includes(item.id);

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors group ${
                        isSelected 
                          ? 'bg-[#1e191b] hover:bg-[#251f22]' 
                          : 'hover:bg-[#121620]/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="w-4 h-4 rounded bg-[#161b24] border-[#273244] text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                        {item.date}
                      </td>

                      {/* Profile */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-300 font-medium">
                        {item.profile}
                      </td>

                      {/* Client Name + Order Id + Risk Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{item.clientName}</span>
                          {item.orderId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161c28] text-neutral-300 border border-[#242e42]" title={`Order ID: ${item.orderId}`}>
                              {item.orderId}
                            </span>
                          )}
                        </div>
                        {(item.riskLevel || item.assignedPerson) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.riskLevel && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium inline-flex items-center gap-1 border ${
                                item.riskLevel === 'Critical'
                                  ? 'bg-red-950/60 text-red-300 border-red-800/60'
                                  : item.riskLevel === 'High'
                                  ? 'bg-orange-950/60 text-orange-300 border-orange-800/60'
                                  : item.riskLevel === 'Medium'
                                  ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60'
                                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  item.riskLevel === 'Critical' ? 'bg-red-400' :
                                  item.riskLevel === 'High' ? 'bg-orange-400' :
                                  item.riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-emerald-400'
                                }`} />
                                <span>{item.riskLevel}</span>
                              </span>
                            )}
                            {item.assignedPerson && (
                              <span className="text-[10px] text-[#94a3b8]" title="Assigned Person">
                                {item.assignedPerson}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Service Column: Interactive pill with dropdown to assign service line */}
                      <td className="py-3.5 px-3 whitespace-nowrap relative service-dropdown-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTeamDropdownId(null);
                            setOpenServiceDropdownId(isServiceOpen ? null : item.id);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:opacity-90 cursor-pointer ${getServiceBadgeStyle(item.service)}`}
                          title="Click to assign Service Line"
                        >
                          <span>{item.service}</span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                        </button>

                        {/* Service Dropdown Menu */}
                        {isServiceOpen && (
                          <div 
                            className="absolute left-2 top-11 z-50 w-44 bg-[#0e1219] border border-[#242e3f] rounded-xl shadow-2xl py-1.5 animate-scaleIn select-none"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 text-[10px] font-semibold text-[#64748b] uppercase tracking-wider border-b border-[#1b222f] mb-1">
                              Assign Service Line
                            </div>
                            {AVAILABLE_SERVICES.map(srv => {
                              const isCurrent = item.service === srv;
                              return (
                                <button
                                  key={srv}
                                  type="button"
                                  onClick={() => {
                                    updateIssue(item.id, { service: srv });
                                    setOpenServiceDropdownId(null);
                                    setToastMessage(`Service for ${item.clientName} assigned to "${srv}".`);
                                  }}
                                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors hover:bg-[#18202d] ${
                                    isCurrent ? 'text-white font-semibold bg-[#141b26]' : 'text-neutral-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${getServiceBadgeStyle(srv).split(' ')[0]}`} />
                                    <span>{srv}</span>
                                  </div>
                                  {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Team Column: Interactive button matching Screenshot with dropdown to assign team */}
                      <td className="py-3.5 px-3 whitespace-nowrap relative team-dropdown-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenServiceDropdownId(null);
                            setOpenTeamDropdownId(isTeamOpen ? null : item.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            isTeamOpen
                              ? 'bg-[#181f2c] border-amber-500/60 text-white shadow-xs'
                              : 'bg-[#141822] border-[#242c3d] text-neutral-300 hover:text-white hover:border-[#344057]'
                          }`}
                          title="Click to assign Team"
                        >
                          <span>{item.team}</span>
                          <ChevronDown className="w-3 h-3 text-[#64748b]" />
                        </button>

                        {/* Team Dropdown Menu Matching Screenshot Exactly */}
                        {isTeamOpen && (
                          <div 
                            className="absolute left-2 top-11 z-50 w-52 bg-[#0e1219] border border-[#242e3f] rounded-xl shadow-2xl py-1.5 animate-scaleIn select-none"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 text-[10px] font-semibold text-[#64748b] uppercase tracking-wider border-b border-[#1b222f] mb-1">
                              Assign Team
                            </div>

                            {AVAILABLE_TEAMS.map(tm => {
                              const isCurrentTeam = item.team === tm;
                              return (
                                <button
                                  key={tm}
                                  type="button"
                                  onClick={() => {
                                    updateIssue(item.id, { team: tm });
                                    setOpenTeamDropdownId(null);
                                    setToastMessage(`Team for ${item.clientName} assigned to "${tm}".`);
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors hover:bg-[#18202d] ${
                                    isCurrentTeam 
                                      ? 'text-white font-medium bg-[#141b26]' 
                                      : 'text-neutral-300 hover:text-white'
                                  }`}
                                >
                                  <span>{tm}</span>
                                  {isCurrentTeam && (
                                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Special Notes & Resolution Log preview */}
                      <td className="py-3.5 px-4 max-w-xs text-neutral-400">
                        <div className="truncate" title={item.specialNotes}>
                          {item.specialNotes || '—'}
                        </div>
                        {item.resolutionNote && (
                          <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1 mt-0.5" title={item.resolutionNote}>
                            <span className="font-semibold text-emerald-300">Done:</span> {item.resolutionNote}
                          </div>
                        )}
                      </td>

                      {/* Order Page */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.orderPageUrl ? (
                          <a
                            href={item.orderPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 hover:text-white text-[11px] font-semibold transition-all group/link"
                            title={`Order Link: ${item.orderPageUrl}`}
                          >
                            <span>Order</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover/link:opacity-100" />
                          </a>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Inbox Page */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.inboxPageUrl ? (
                          <a
                            href={item.inboxPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/35 text-blue-300 hover:text-white text-[11px] font-semibold transition-all group/link"
                            title={`Inbox Link: ${item.inboxPageUrl}`}
                          >
                            <span>Inbox</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover/link:opacity-100" />
                          </a>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* File/Meeting Link & Attachments Hub */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.fileMeetingLink && (
                            <a
                              href={item.fileMeetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 hover:text-white text-[11px] font-semibold transition-all group/link"
                              title={`File / Meet Link: ${item.fileMeetingLink}`}
                            >
                              <span>Meet/File</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover/link:opacity-100" />
                            </a>
                          )}

                          {item.attachmentUrls && item.attachmentUrls.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setAttachmentHubIssue(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35"
                              title="Open All Attachments & Resources Hub"
                            >
                              <Paperclip className="w-3 h-3 text-cyan-400" />
                              <span>+{item.attachmentUrls.length} Files</span>
                            </button>
                          )}

                          {!item.fileMeetingLink && (!item.attachmentUrls || item.attachmentUrls.length === 0) && (
                            <span className="text-neutral-600">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={item.status}
                            onChange={e => handleInitiateStatusChange(item, e.target.value as IssueStatus)}
                            className={`appearance-none cursor-pointer text-xs font-semibold px-3 py-1 pr-6 rounded-lg border transition-all text-center focus:outline-none ${
                              item.status === 'done'
                                ? 'bg-[#153423] text-[#4ade80] border-[#22c55e]/50'
                                : item.status === 'in progress'
                                ? 'bg-[#372d13] text-[#facc15] border-[#eab308]/50'
                                : 'bg-[#3b1717] text-[#f87171] border-[#ef4444]/50'
                            }`}
                          >
                            <option value="open">open</option>
                            <option value="in progress">in progress</option>
                            <option value="done">done</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-70" />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status === 'done' ? (
                            <button
                              onClick={() => handleReopen(item)}
                              className="px-2 py-1 rounded bg-[#18221c] hover:bg-[#203125] text-emerald-400 border border-emerald-800/40 text-[11px] flex items-center gap-1 transition-colors"
                              title="Reopen issue and return to Active sheet"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="hidden md:inline">Reopen</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingIssue(item);
                                setResolutionText('');
                              }}
                              className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title="Mark as Done (Write work log and remove from active sheet)"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Done</span>
                            </button>
                          )}

                          <button
                            onClick={() => setEditingIssue(item)}
                            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1f2633] transition-colors"
                            title="Edit Issue"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setViewingIssue(item)}
                            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1f2633] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setIssueToDelete(item)}
                            className="p-1 rounded text-[#64748b] hover:text-red-400 hover:bg-[#1f2633] transition-colors cursor-pointer"
                            title="Delete Issue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Screenshot */}
        <div className="p-4 border-t border-[#1a212c] bg-[#0c0f15] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs select-none">
          <div className="text-[#64748b]">
            Showing <span className="text-white font-mono">{filteredIssues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="text-white font-mono">{Math.min(currentPage * itemsPerPage, filteredIssues.length)}</span> of{' '}
            <span className="text-white font-mono">{filteredIssues.length}</span> issues
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#1e2531] text-[#94a3b8] hover:text-white disabled:opacity-40 disabled:hover:text-[#94a3b8] flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                currentPage === 1 ? 'bg-white text-black' : 'border border-[#1e2531] text-neutral-400 hover:text-white'
              }`}
            >
              1
            </button>

            {totalPages >= 2 && (
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                  currentPage === 2 ? 'bg-white text-black' : 'border border-[#1e2531] text-neutral-400 hover:text-white'
                }`}
              >
                2
              </button>
            )}

            {totalPages >= 3 && (
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                  currentPage === 3 ? 'bg-white text-black' : 'border border-[#1e2531] text-neutral-400 hover:text-white'
                }`}
              >
                3
              </button>
            )}

            {totalPages > 4 && (
              <>
                <span className="text-neutral-500 px-1">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold ${
                    currentPage === totalPages ? 'bg-white text-black' : 'border border-[#1e2531] text-neutral-400 hover:text-white'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#1e2531] text-[#94a3b8] hover:text-white disabled:opacity-40 disabled:hover:text-[#94a3b8] flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DELETE ALL DONE ISSUES CONFIRMATION MODAL                                 */}
      {/* ========================================================================= */}
      {isDeleteAllDoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-red-900/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete All Done Issues?</h3>
                <p className="text-xs text-neutral-400">সব সম্পন্ন হওয়া ইস্যু স্থায়ীভাবে মুছে ফেলবেন?</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#151214] p-3 rounded-xl border border-red-900/30">
              This action will permanently delete all <strong className="text-red-400 font-bold">{resolvedCount}</strong> resolved issue(s) from the system. This cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllDoneModalOpen(false)}
                className="px-4 py-2 text-xs rounded-lg bg-[#181d26] text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAllDone}
                className="px-4 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
              >
                Yes, Delete All Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE ISSUE DELETE IN-APP CONFIRMATION MODAL                             */}
      {/* ========================================================================= */}
      {issueToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0f131a] border border-[#273244] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Issue?</h3>
                <p className="text-xs text-[#94a3b8]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#151214] p-3 rounded-xl border border-red-900/30">
              Are you sure you want to permanently delete the issue for <strong className="text-white font-semibold">"{issueToDelete.clientName}"</strong>{issueToDelete.orderId ? ` (Order: ${issueToDelete.orderId})` : ''}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIssueToDelete(null)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = issueToDelete.clientName;
                  deleteIssue(issueToDelete.id);
                  setIssueToDelete(null);
                  setToastMessage(`✓ Issue for "${name}" deleted.`);
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK DELETE CONFIRMATION MODAL                                            */}
      {/* ========================================================================= */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0f131a] border border-[#273244] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Selected Issues?</h3>
                <p className="text-xs text-[#94a3b8]">Bulk permanent removal</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#151214] p-3 rounded-xl border border-red-900/30">
              Are you sure you want to delete <strong className="text-white font-bold">{selectedIssueIds.length}</strong> selected issue(s)?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const count = selectedIssueIds.length;
                  deleteMultipleIssues(selectedIssueIds);
                  setSelectedIssueIds([]);
                  setIsBulkDeleteModalOpen(false);
                  setToastMessage(`✓ ${count} selected issue(s) deleted successfully.`);
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete {selectedIssueIds.length} Issues</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESOLUTION MESSAGE BOX MODAL (Work log submission)                        */}
      {/* ========================================================================= */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Complete Issue & Submit Work Log</h3>
                  <p className="text-xs text-[#94a3b8]">কাজ সম্পন্ন করতে কি কাজ করেছেন তা সংক্ষেপে লিখুন</p>
                </div>
              </div>

              <button
                onClick={() => setResolvingIssue(null)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Issue Context Card */}
            <div className="p-3.5 rounded-xl bg-[#141822] border border-[#222b3b] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">
                  {resolvingIssue.clientName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getServiceBadgeStyle(resolvingIssue.service)}`}>
                  {resolvingIssue.service}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-400 pt-1 border-t border-[#1f2838]">
                <div>Store: <strong className="text-amber-300 font-mono font-normal">{resolvingIssue.profile}</strong></div>
                <div>Team: <strong className="text-neutral-200 font-normal">{resolvingIssue.team}</strong></div>
              </div>
              {resolvingIssue.specialNotes && (
                <p className="text-[#94a3b8] text-[11px] italic bg-[#0f131c] p-2 rounded border border-[#1b2230]">
                  "{resolvingIssue.specialNotes}"
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmResolution} className="space-y-4 text-xs">
              <div>
                <label className="text-white font-semibold block mb-1.5 flex items-center justify-between">
                  <span>কি কাজ করেছেন বিস্তারিত লিখুন (What work was performed?): *</span>
                  <span className="text-[11px] text-amber-400 font-normal">আবশ্যক (Required)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  autoFocus
                  placeholder="যেমন: theme.liquid ফাইলে রেস্পন্সিভ সিএসএস কোড ফিক্স করেছি, কার্ট রি-ক্যালকুলেশন টেস্ট করেছি এবং ক্লায়েন্টকে ইনবক্সে কনফার্মেশন মেসেজ পাঠিয়েছি..."
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#161b24] border border-[#273244] rounded-xl text-white placeholder:text-[#64748b] focus:outline-none focus:border-emerald-500 leading-relaxed text-xs"
                />
              </div>

              {/* Quick Template Tag Shortcuts */}
              <div>
                <span className="text-[11px] text-[#64748b] block mb-1.5">দ্রুত সিলেক্ট করুন (Quick snippets):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Fixed liquid layout & CSS styles',
                    'Cart recalculation & Drawer fixed',
                    'Speed optimized (<2s LCP)',
                    'Sent preview to client inbox',
                    'Resolved responsive bug on mobile'
                  ].map(snippet => (
                    <button
                      key={snippet}
                      type="button"
                      onClick={() => setResolutionText(prev => prev ? `${prev} + ${snippet}` : snippet)}
                      className="px-2 py-1 rounded-md bg-[#18202d] hover:bg-[#222c3d] text-[#93c5fd] border border-[#263347] text-[11px] transition-colors"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Also log to Update Sheet Checkbox */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141822] border border-[#222b3b]">
                <input
                  type="checkbox"
                  id="autoLogUpdate"
                  checked={logToUpdateSheet}
                  onChange={e => setLogToUpdateSheet(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#161b24] border-[#273244] text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="autoLogUpdate" className="text-neutral-200 cursor-pointer select-none">
                  অটোমেটিক <strong>Update Sheet (Entries)</strong> এ লগ করুন
                  <span className="text-[#64748b] block text-[11px]">
                    টিমের সবাই যেন আপডেট শিটে সমাধান দেখতে পায়
                  </span>
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-[#1a160c] border border-amber-900/40 text-[11px] text-amber-300">
                ⚡ কনফার্ম করলে ইস্যুটি "Done" হবে এবং একটিভ শিট থেকে রিমুভ হয়ে যাবে। (Resolved History ট্যাবে সংরক্ষিত থাকবে)
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm & Complete Issue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create New Issue Record</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">Fill in the issue information and add reference links</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
              {/* Row 1: Profile | Client Name | Order ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Profile / Account *</label>
                  <select
                    value={formData.profile}
                    onChange={e => setFormData({ ...formData, profile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {uniqueProfiles.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Client Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. fafo101"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Order ID</label>
                  <input
                    type="text"
                    placeholder="ex: FO72EC86A2647"
                    value={formData.orderId}
                    onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Service Line | Assigned Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Service Line</label>
                  <select
                    value={formData.service}
                    onChange={e => setFormData({ ...formData, service: e.target.value as ServiceType })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none"
                  >
                    {AVAILABLE_SERVICES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Assigned Team</label>
                  <select
                    value={formData.team}
                    onChange={e => setFormData({ ...formData, team: e.target.value as TeamType })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none"
                  >
                    {AVAILABLE_TEAMS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Special Notes */}
              <div>
                <label className="text-[#94a3b8] block mb-1 font-medium">Special Notes</label>
                <textarea
                  rows={2}
                  placeholder="ex: Scheduled meeting at 12 Sep, 2025 at 9:00 AM"
                  value={formData.specialNotes}
                  onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Row 4: Order Page URL | Inbox Page URL | File/Meeting Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Order Page URL</label>
                  <input
                    type="text"
                    placeholder="paste google drive link"
                    value={formData.orderPageUrl}
                    onChange={e => setFormData({ ...formData, orderPageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Inbox Page URL</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={formData.inboxPageUrl}
                    onChange={e => setFormData({ ...formData, inboxPageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">File / Meeting Link</label>
                  <input
                    type="text"
                    placeholder="ex: Paste google file url"
                    value={formData.fileMeetingLink}
                    onChange={e => setFormData({ ...formData, fileMeetingLink: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Row 5: Assigned Person & Risk Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Assigned Person</label>
                  <input
                    type="text"
                    placeholder="ex: Monir/Adnan"
                    value={formData.assignedPerson}
                    onChange={e => setFormData({ ...formData, assignedPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">
                    RISK LEVEL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map(lvl => {
                      const isSel = formData.riskLevel === lvl;
                      const dot = lvl === 'Low' ? 'bg-emerald-400' : lvl === 'Medium' ? 'bg-yellow-400' : lvl === 'High' ? 'bg-orange-400' : 'bg-red-400';
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, riskLevel: lvl })}
                          className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSel
                              ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-semibold'
                              : 'border-[#273244] bg-[#161b24] text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          <span>{lvl}</span>
                          {isSel && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 6: Note for Sales */}
              <div>
                <label className="text-[#94a3b8] block mb-1 font-medium">Note for Sales</label>
                <input
                  type="text"
                  placeholder="ex: Please arrange a meeting"
                  value={formData.salesNote}
                  onChange={e => setFormData({ ...formData, salesNote: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white focus:outline-none"
                />
              </div>

              {/* Dynamic Additional Attachment URLs */}
              <div className="p-3.5 rounded-xl bg-[#141822] border border-[#232c3d] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-white">Additional Attachment URLs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        attachmentUrls: [
                          ...prev.attachmentUrls,
                          { id: `att-${Date.now()}`, label: '', url: '' }
                        ]
                      }));
                    }}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attachment URL</span>
                  </button>
                </div>

                {formData.attachmentUrls.length === 0 ? (
                  <p className="text-[11px] text-[#64748b]">No extra attachment URLs added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.attachmentUrls.map((att, idx) => (
                      <div key={att.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Figma)"
                          value={att.label}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              attachmentUrls: prev.attachmentUrls.map(a => a.id === att.id ? { ...a, label: val } : a)
                            }));
                          }}
                          className="w-1/3 px-2.5 py-1.5 bg-[#1b212d] border border-[#293448] rounded-lg text-white text-xs"
                        />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={att.url}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              attachmentUrls: prev.attachmentUrls.map(a => a.id === att.id ? { ...a, url: val } : a)
                            }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-[#1b212d] border border-[#293448] rounded-lg text-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attachmentUrls: prev.attachmentUrls.filter(a => a.id !== att.id)
                            }));
                          }}
                          className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Details Modal */}
      {viewingIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <span className="text-[11px] font-mono text-neutral-400">{viewingIssue.date}</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{viewingIssue.clientName}</span>
                  {viewingIssue.orderId && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161c28] text-amber-300 border border-[#242e42]">
                      {viewingIssue.orderId}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${getServiceBadgeStyle(viewingIssue.service)}`}>
                    {viewingIssue.service}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setViewingIssue(null)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Context grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#151922] border border-[#1e2736]">
                <div>
                  <span className="text-[#64748b] block text-[10px]">Store Profile</span>
                  <span className="text-white font-mono font-semibold">{viewingIssue.profile}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Assigned Team</span>
                  <span className="text-white font-medium">{viewingIssue.team}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Assigned Person</span>
                  <span className="text-white font-medium">{viewingIssue.assignedPerson || '—'}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Risk Level</span>
                  <span className={`font-semibold inline-flex items-center gap-1 ${
                    viewingIssue.riskLevel === 'Critical' ? 'text-red-400' :
                    viewingIssue.riskLevel === 'High' ? 'text-orange-400' :
                    viewingIssue.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    ● {viewingIssue.riskLevel || 'Low'}
                  </span>
                </div>
              </div>

              {/* Special notes */}
              <div>
                <span className="text-[#64748b] block mb-1">Special Notes / Technical Log:</span>
                <div className="p-3 rounded-xl bg-[#151922] text-neutral-200 border border-[#212937] leading-relaxed">
                  {viewingIssue.specialNotes || 'No special notes provided.'}
                </div>
              </div>

              {/* Sales note */}
              {viewingIssue.salesNote && (
                <div>
                  <span className="text-amber-400/90 font-medium block mb-1">Note for Sales:</span>
                  <div className="p-3 rounded-xl bg-[#191610] text-amber-200 border border-amber-900/40 leading-relaxed">
                    {viewingIssue.salesNote}
                  </div>
                </div>
              )}

              {/* Standard Links */}
              <div className="p-3 rounded-xl bg-[#151922] border border-[#212937] space-y-2">
                <span className="text-[#64748b] block font-semibold">Standard Links:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-[#10141d] border border-[#1d2535]">
                    <span className="text-[10px] text-[#64748b] block">Order Page</span>
                    {viewingIssue.orderPageUrl ? (
                      <a href={viewingIssue.orderPageUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 mt-0.5 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Open Order Link</span>
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>

                  <div className="p-2 rounded bg-[#10141d] border border-[#1d2535]">
                    <span className="text-[10px] text-[#64748b] block">Inbox Page</span>
                    {viewingIssue.inboxPageUrl ? (
                      <a href={viewingIssue.inboxPageUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 mt-0.5 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Open Inbox Link</span>
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>

                  <div className="p-2 rounded bg-[#10141d] border border-[#1d2535]">
                    <span className="text-[10px] text-[#64748b] block">File / Meeting</span>
                    {viewingIssue.fileMeetingLink ? (
                      <a href={viewingIssue.fileMeetingLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 mt-0.5 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Open Link</span>
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Attachment URLs */}
              <div className="p-3.5 rounded-xl bg-[#141822] border border-[#212937] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>All Attachments & Resources</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {((viewingIssue.orderPageUrl ? 1 : 0) + (viewingIssue.inboxPageUrl ? 1 : 0) + (viewingIssue.fileMeetingLink ? 1 : 0) + (viewingIssue.attachmentUrls ? viewingIssue.attachmentUrls.length : 0))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingIssue;
                      setViewingIssue(null);
                      setAttachmentHubIssue(target);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Hub</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                {viewingIssue.attachmentUrls && viewingIssue.attachmentUrls.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewingIssue.attachmentUrls.map((att, idx) => (
                      <div key={att.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0e1219] border border-[#1e2736]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-semibold shrink-0">
                            {att.label || `Link #${idx + 1}`}
                          </span>
                          <span className="text-neutral-300 font-mono text-[11px] truncate">
                            {att.url}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(att.url);
                              setToastMessage('Link copied to clipboard!');
                            }}
                            className="p-1 rounded text-[#94a3b8] hover:text-white"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-amber-400 hover:text-amber-300"
                            title="Open link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748b] text-[11px]">No extra attachment links added yet. Click "Open Hub" to add Figma, Loom, or Drive links.</p>
                )}
              </div>

              {/* Resolution Work Log display */}
              {viewingIssue.resolutionNote && (
                <div>
                  <span className="text-emerald-400 font-semibold block mb-1">
                    Work Done / Resolution Log (কাজ সম্পন্ন করার বিবরণ):
                  </span>
                  <div className="p-3 rounded-xl bg-[#112418] text-emerald-200 border border-emerald-800/50 leading-relaxed">
                    {viewingIssue.resolutionNote}
                    {viewingIssue.completedAt && (
                      <div className="text-[10px] text-emerald-400/70 mt-2 font-mono">
                        Resolved on {viewingIssue.completedAt} by {viewingIssue.completedBy || 'Developer'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#202937]">
              <button
                type="button"
                onClick={() => {
                  const target = viewingIssue;
                  setViewingIssue(null);
                  setEditingIssue(target);
                }}
                className="px-3.5 py-2 text-xs rounded-lg bg-[#1a2230] text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit This Issue</span>
              </button>

              <button
                onClick={() => setViewingIssue(null)}
                className="px-4 py-2 text-xs rounded-lg bg-neutral-800 text-white hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Attachment Hub Modal */}
      <AttachmentHubModal
        issue={attachmentHubIssue}
        isOpen={!!attachmentHubIssue}
        onClose={() => setAttachmentHubIssue(null)}
        onUpdateIssue={(id, updated) => {
          updateIssue(id, updated);
          setAttachmentHubIssue(prev => prev ? { ...prev, ...updated } : null);
          setToastMessage('✓ Attachments updated successfully.');
        }}
      />
    </div>
  );
};
