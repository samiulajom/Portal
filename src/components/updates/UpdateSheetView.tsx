import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Plus, 
  Download, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Trash2, 
  CheckCircle2, 
  RotateCcw 
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { UpdateEntry } from '../../types';
import { AddUpdateEntryView } from './AddUpdateEntryView';
import { EditUpdateEntryView } from './EditUpdateEntryView';
import { MessageDetailsModal } from './MessageDetailsModal';

export const UpdateSheetView: React.FC = () => {
  const { updates, addUpdate, updateUpdate, deleteUpdate, toggleTlCheck, updateProfileFilter, setUpdateProfileFilter, user } = usePortal();

  // Tab State: 'active' (Unsent/Pending), 'completed' (Sent/Done), 'all' (Everything)
  const [viewTab, setViewTab] = useState<'active' | 'completed' | 'all'>('active');

  // Filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState(updateProfileFilter || 'All');
  const [updateByFilter, setUpdateByFilter] = useState('All');
  const [tlFilter, setTlFilter] = useState('All');

  // Sync profileFilter when updateProfileFilter changes from Overview
  useEffect(() => {
    if (updateProfileFilter) {
      setProfileFilter(updateProfileFilter);
    }
  }, [updateProfileFilter]);

  // Dedicated View states
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<UpdateEntry | null>(null);
  const [activeMessageModal, setActiveMessageModal] = useState<UpdateEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Unique profiles & updaters
  const uniqueProfiles = useMemo(() => Array.from(new Set(updates.map(u => u.profile))), [updates]);
  const uniqueUpdaters = useMemo(() => Array.from(new Set(updates.map(u => u.updateBy))), [updates]);

  // Tab counts
  const activeCount = useMemo(() => updates.filter(u => u.status !== 'completed').length, [updates]);
  const completedCount = useMemo(() => updates.filter(u => u.status === 'completed').length, [updates]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return updates.filter(item => {
      // Tab filter
      if (viewTab === 'active' && item.status === 'completed') return false;
      if (viewTab === 'completed' && item.status !== 'completed') return false;

      const matchesSearch =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.updateBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.orderId && item.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProfile = profileFilter === 'All' || item.profile === profileFilter;
      const matchesUpdateBy = updateByFilter === 'All' || item.updateBy === updateByFilter;
      const matchesTl = 
        tlFilter === 'All' || 
        (tlFilter === 'checked' && item.tlCheck) || 
        (tlFilter === 'pending' && !item.tlCheck);

      return matchesSearch && matchesProfile && matchesUpdateBy && matchesTl;
    });
  }, [updates, viewTab, searchQuery, profileFilter, updateByFilter, tlFilter]);

  // Complete / Send Handler
  const handleMarkAsSent = (id: string) => {
    const target = updates.find(u => u.id === id);
    const now = new Date();
    const sentTimeStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    updateUpdate(id, {
      status: 'completed',
      sentAt: sentTimeStr,
      sentBy: user?.name || 'Sales'
    });

    if (activeMessageModal && activeMessageModal.id === id) {
      setActiveMessageModal(null);
    }

    setToastMessage(`✓ Message for "${target?.clientName || 'Client'}" sent & moved to Done list.`);
  };

  // Reopen / Move to Active Handler
  const handleReopen = (id: string) => {
    const target = updates.find(u => u.id === id);
    updateUpdate(id, {
      status: 'pending'
    });

    if (activeMessageModal && activeMessageModal.id === id) {
      setActiveMessageModal(null);
    }

    setToastMessage(`✓ Entry for "${target?.clientName || 'Client'}" restored to Active list.`);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Status', 'Profile', 'Client', 'Order ID', 'Update By', 'Message', 'Comment (Operation)', 'Comment (Sales)', 'TL Check', 'TL At', 'Update To'];
    const rows = filteredEntries.map(u => [
      `"${u.date}"`,
      `"${u.status === 'completed' ? 'Done/Sent' : 'Active/Pending'}"`,
      `"${u.profile}"`,
      `"${u.clientName}"`,
      `"${u.orderId || ''}"`,
      `"${u.updateBy}"`,
      `"${u.message.replace(/"/g, '""')}"`,
      `"${(u.commentOperation || '').replace(/"/g, '""')}"`,
      `"${(u.commentSales || '').replace(/"/g, '""')}"`,
      `"${u.tlCheck ? 'Checked' : 'Unchecked'}"`,
      `"${u.tlAt}"`,
      `"${u.updateTo}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `update_entries_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // 1. DEDICATED FULL SCREEN ADD ENTRY VIEW (Matching Screenshot 1)
  if (isAddingEntry) {
    return (
      <div className="animate-fadeIn relative">
        <AddUpdateEntryView
          onBack={() => setIsAddingEntry(false)}
          onSave={(newEntry) => {
            addUpdate({ ...newEntry, status: 'pending' });
            setIsAddingEntry(false);
            setToastMessage('✓ New update entry added to Active list.');
          }}
          availableProfiles={uniqueProfiles}
          currentUser={user?.name || 'Samiul'}
        />
      </div>
    );
  }

  // 2. DEDICATED FULL SCREEN EDIT ENTRY VIEW (Matching Screenshot 2 + Send & Complete)
  if (editingEntry) {
    return (
      <div className="animate-fadeIn relative">
        <EditUpdateEntryView
          entry={editingEntry}
          onBack={() => setEditingEntry(null)}
          onSave={(updated) => {
            updateUpdate(updated.id, updated);
            setEditingEntry(null);
            setToastMessage(`✓ Update entry for "${updated.clientName}" saved.`);
          }}
          onSendComplete={(updated) => {
            updateUpdate(updated.id, {
              ...updated,
              status: 'completed'
            });
            setEditingEntry(null);
            setToastMessage(`✓ Message for "${updated.clientName}" sent & moved to Done list.`);
          }}
          onDelete={(id) => {
            deleteUpdate(id);
            setEditingEntry(null);
            setToastMessage('✓ Update entry deleted successfully.');
          }}
          availableProfiles={uniqueProfiles}
          currentUser={user?.name || 'Sales'}
        />
      </div>
    );
  }

  // 3. MAIN TABLE VIEW
  return (
    <div className="space-y-5 animate-fadeIn relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#14261d] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slideIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Entries</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            All update entries in one place — mark sent messages to archive them into the Done list.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              isFilterOpen || profileFilter !== 'All' || tlFilter !== 'All'
                ? 'bg-[#1e1c12] border-amber-500/60 text-amber-300'
                : 'bg-[#11141c] border-[#1e2531] text-neutral-300 hover:text-white hover:bg-[#171c26]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(profileFilter !== 'All' || tlFilter !== 'All') && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#11141c] border border-[#1e2531] text-neutral-300 hover:text-white hover:bg-[#171c26] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddingEntry(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* View Tabs: Active/Pending (Default) vs Done/Completed vs All */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a212c] pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewTab('active')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'active'
                ? 'bg-[#1e1c12] text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <span>Active / Pending Send</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-semibold">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'completed'
                ? 'bg-[#12281a] text-emerald-300 border border-emerald-500/50 shadow-xs'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done / Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-semibold">
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'all'
                ? 'bg-[#161c28] text-white border border-[#27354d]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#121620]'
            }`}
          >
            <span>All Entries</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-300">
              {updates.length}
            </span>
          </button>

          {/* Active Profile Filter Indicator Badge from Overview selection */}
          {profileFilter !== 'All' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e1c12] border border-amber-500/60 text-amber-300 text-xs shadow-xs animate-scaleIn">
              <span>Profile: <strong className="font-mono">{profileFilter}</strong></span>
              <button
                onClick={() => { setProfileFilter('All'); setUpdateProfileFilter('All'); }}
                className="text-amber-400 hover:text-white ml-1 cursor-pointer"
                title="Clear profile filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {viewTab === 'completed' && completedCount > 0 && (
          <span className="text-[11px] text-emerald-400 font-medium">
            ✓ Sent messages archived here
          </span>
        )}
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="p-4 rounded-xl bg-[#0e1219] border border-[#1e2736] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b222f]">
            <span className="text-xs font-semibold text-neutral-200">Filter Update Entries</span>
            <button
              onClick={() => {
                setProfileFilter('All');
                setUpdateByFilter('All');
                setTlFilter('All');
                setSearchQuery('');
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
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
                  placeholder="Client, profile, or message..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white placeholder:text-[#55657e] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Profile</label>
              <select
                value={profileFilter}
                onChange={e => setProfileFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white"
              >
                <option value="All">All Profiles</option>
                {uniqueProfiles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Update By</label>
              <select
                value={updateByFilter}
                onChange={e => setUpdateByFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white"
              >
                <option value="All">All Staff</option>
                {uniqueUpdaters.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">TL Verification</label>
              <select
                value={tlFilter}
                onChange={e => setTlFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white"
              >
                <option value="All">All Entries</option>
                <option value="checked">TL Checked (Verified)</option>
                <option value="pending">Pending TL Check</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[#0b0e13] border border-[#1a212c] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a212c] text-[#8592a6] bg-[#0d1017]/80 font-medium select-none">
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-3 font-normal text-center">Status</th>
                <th className="py-3 px-4 font-normal">Profile</th>
                <th className="py-3 px-4 font-normal">Client Name</th>
                <th className="py-3 px-3 font-normal">Update By</th>
                <th className="py-3 px-3 font-normal text-center">Message</th>
                <th className="py-3 px-4 font-normal">Comment (Operation)</th>
                <th className="py-3 px-4 font-normal">Comment (Sales)</th>
                <th className="py-3 px-3 font-normal text-center">TL Check</th>
                <th className="py-3 px-3 font-normal">TL At</th>
                <th className="py-3 px-3 font-normal">Update To</th>
                <th className="py-3 px-3 font-normal">Done By</th>
                <th className="py-3 px-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171d27] text-neutral-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-[#64748b]">
                    {viewTab === 'completed'
                      ? 'No completed entries yet. When you send messages, they will appear here.'
                      : 'No active update entries found.'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map(item => {
                  const isDone = item.status === 'completed';
                  return (
                    <tr key={item.id} className="hover:bg-[#121620]/70 transition-colors group">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                        {item.date}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold inline-flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-medium">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Profile */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-300 font-medium">
                        {item.profile}
                      </td>

                      {/* Client Name & Order ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-white font-medium">
                        <div className="flex flex-col">
                          <span>{item.clientName}</span>
                          {item.orderId && (
                            <span className="text-[10px] text-neutral-500 font-mono tracking-tight">
                              {item.orderId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Update By */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-300 font-mono">
                        {item.updateBy}
                      </td>

                      {/* Message Button "View" */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setActiveMessageModal(item)}
                          className="px-2.5 py-1 rounded bg-[#171c26] hover:bg-[#202736] text-neutral-200 border border-[#273244] font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>

                      {/* Comment (Operation) pill badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.commentOperation ? (
                          <span className="px-2.5 py-1 rounded-md bg-[#e2e8f0] text-black font-medium text-[11px] shadow-xs">
                            {item.commentOperation}
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Comment (Sales) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {item.commentSales ? (
                          <p className={`text-[11px] leading-snug line-clamp-2 ${
                            item.commentSales.includes('Website er URL') || item.commentSales.includes('review kore')
                              ? 'text-red-400 font-medium'
                              : 'text-neutral-300'
                          }`}>
                            {item.commentSales}
                          </p>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* TL Check */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleTlCheck(item.id)}
                          className={`w-4 h-4 rounded inline-flex items-center justify-center transition-colors cursor-pointer ${
                            item.tlCheck
                              ? 'bg-emerald-600 text-white'
                              : 'border border-[#384357] bg-[#141822] hover:border-neutral-400'
                          }`}
                          title={item.tlCheck ? 'TL Verified (Click to uncheck)' : 'Click to TL check'}
                        >
                          {item.tlCheck && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* TL At */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-neutral-300 text-[11px]">
                        {item.tlAt || '—'}
                      </td>

                      {/* Update To */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] text-[11px] font-medium">
                          {item.updateTo}
                        </span>
                      </td>

                      {/* Done By */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-400">
                        {item.doneBy || '—'}
                      </td>

                      {/* Action (Complete / Reopen + Edit pencil + Trash) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Complete / Send button */}
                          {isDone ? (
                            <button
                              onClick={() => handleReopen(item.id)}
                              className="p-1 rounded text-[#94a3b8] hover:text-amber-300 hover:bg-[#1f2633] transition-colors cursor-pointer"
                              title="Restore to Active list"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsSent(item.id)}
                              className="p-1 rounded text-[#94a3b8] hover:text-emerald-400 hover:bg-[#1f2633] transition-colors cursor-pointer"
                              title="Send / Complete (Move to Done)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setEditingEntry(item)}
                            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1f2633] transition-colors cursor-pointer"
                            title="Edit Entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              deleteUpdate(item.id);
                              setToastMessage(`✓ Entry for "${item.clientName}" deleted.`);
                            }}
                            className="p-1 rounded text-[#94a3b8] hover:text-red-400 hover:bg-[#1f2633] transition-colors cursor-pointer"
                            title="Delete Entry"
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
      </div>

      {/* Message Details Modal Matching Screenshot + Mark as Sent */}
      <MessageDetailsModal
        entry={activeMessageModal}
        isOpen={!!activeMessageModal}
        onClose={() => setActiveMessageModal(null)}
        onMarkAsSent={handleMarkAsSent}
        onReopen={handleReopen}
      />
    </div>
  );
};
