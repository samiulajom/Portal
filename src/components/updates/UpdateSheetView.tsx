import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Plus, 
  Download, 
  Edit3, 
  MoreVertical, 
  Check, 
  X, 
  Search, 
  MessageSquare, 
  Eye,
  Trash2,
  Copy
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { UpdateEntry } from '../../types';

export const UpdateSheetView: React.FC = () => {
  const { updates, addUpdate, updateUpdate, deleteUpdate, toggleTlCheck } = usePortal();

  // Filters state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState('All');
  const [updateByFilter, setUpdateByFilter] = useState('All');
  const [tlFilter, setTlFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMessageModal, setActiveMessageModal] = useState<UpdateEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<UpdateEntry | null>(null);

  // New entry form state
  const [formData, setFormData] = useState({
    profile: 'web_mania_Fiverr',
    clientName: '',
    updateBy: '@msifat17088',
    message: '',
    commentOperation: '',
    commentSales: '',
    tlCheck: false,
    tlAt: '@Sushmoy',
    updateTo: 'Inbox Page' as 'Inbox Page' | 'Inbox & Order' | 'Order Page',
    doneBy: ''
  });

  // Unique profiles & updaters
  const uniqueProfiles = useMemo(() => Array.from(new Set(updates.map(u => u.profile))), [updates]);
  const uniqueUpdaters = useMemo(() => Array.from(new Set(updates.map(u => u.updateBy))), [updates]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return updates.filter(item => {
      const matchesSearch =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.updateBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProfile = profileFilter === 'All' || item.profile === profileFilter;
      const matchesUpdateBy = updateByFilter === 'All' || item.updateBy === updateByFilter;
      const matchesTl = 
        tlFilter === 'All' || 
        (tlFilter === 'checked' && item.tlCheck) || 
        (tlFilter === 'pending' && !item.tlCheck);

      return matchesSearch && matchesProfile && matchesUpdateBy && matchesTl;
    });
  }, [updates, searchQuery, profileFilter, updateByFilter, tlFilter]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Profile', 'Client', 'Update By', 'Message', 'Comment (Operation)', 'Comment (Sales)', 'TL Check', 'TL At', 'Update To'];
    const rows = filteredEntries.map(u => [
      `"${u.date}"`,
      `"${u.profile}"`,
      `"${u.clientName}"`,
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

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.message.trim()) return;

    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    addUpdate({
      date: dateStr,
      profile: formData.profile,
      clientName: formData.clientName,
      updateBy: formData.updateBy,
      message: formData.message,
      commentOperation: formData.commentOperation,
      commentSales: formData.commentSales,
      tlCheck: formData.tlCheck,
      tlAt: formData.tlAt,
      updateTo: formData.updateTo,
      doneBy: formData.doneBy || formData.updateBy.replace('@', '')
    });

    setFormData({
      profile: 'web_mania_Fiverr',
      clientName: '',
      updateBy: '@msifat17088',
      message: '',
      commentOperation: '',
      commentSales: '',
      tlCheck: false,
      tlAt: '@Sushmoy',
      updateTo: 'Inbox Page',
      doneBy: ''
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header section matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Entries</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            All update entries in one place — apply filters to quickly find what you need.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all ${
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
            <span>Add Entry</span>
          </button>
        </div>
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
                  placeholder="Client, message..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151922] border border-[#242d3d] rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#94a3b8] block mb-1">Store Profile</label>
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

      {/* Main Table Matching Screenshot 4 */}
      <div className="bg-[#0b0e13] border border-[#1a212c] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a212c] text-[#8592a6] bg-[#0d1017]/80 font-medium select-none">
                <th className="py-3 px-4 font-normal">Date</th>
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
                  <td colSpan={12} className="py-12 text-center text-[#64748b]">
                    No update entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(item => (
                  <tr key={item.id} className="hover:bg-[#121620]/70 transition-colors group">
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                      {item.date}
                    </td>

                    {/* Profile */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-300 font-medium">
                      {item.profile}
                    </td>

                    {/* Client Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-white font-medium">
                      {item.clientName}
                    </td>

                    {/* Update By */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-300 font-mono">
                      {item.updateBy}
                    </td>

                    {/* Message Button "View" */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setActiveMessageModal(item)}
                        className="px-2.5 py-1 rounded bg-[#171c26] hover:bg-[#202736] text-neutral-200 border border-[#273244] font-medium transition-colors"
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

                    {/* Comment (Sales) - Note the red highlight in screenshot! */}
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

                    {/* TL Check - Checkbox matching screenshot */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleTlCheck(item.id)}
                        className={`w-4 h-4 rounded inline-flex items-center justify-center transition-colors ${
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

                    {/* Update To (Pill badge in light cream/amber matching screenshot) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] text-[11px] font-medium">
                        {item.updateTo}
                      </span>
                    </td>

                    {/* Done By */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-400">
                      {item.doneBy || '—'}
                    </td>

                    {/* Action (Edit pencil + More menu) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingEntry(item)}
                          className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1f2633] transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUpdate(item.id)}
                          className="p-1 rounded text-[#94a3b8] hover:text-red-400 hover:bg-[#1f2633] transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Message Modal */}
      {activeMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <span className="text-[11px] font-mono text-neutral-400">{activeMessageModal.date}</span>
                <h3 className="text-base font-bold text-white">
                  Message Log for {activeMessageModal.clientName}
                </h3>
              </div>
              <button
                onClick={() => setActiveMessageModal(null)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#151922] text-neutral-200 border border-[#212937] whitespace-pre-wrap leading-relaxed">
                {activeMessageModal.message}
              </div>

              {activeMessageModal.commentSales && (
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-red-300">
                  <span className="font-semibold block mb-0.5">Sales Note / Warning:</span>
                  {activeMessageModal.commentSales}
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-400 pt-2">
                <span>Updated by: <strong className="text-white font-mono">{activeMessageModal.updateBy}</strong></span>
                <span>TL Reviewer: <strong className="text-white font-mono">{activeMessageModal.tlAt}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#202937]">
              <button
                onClick={() => setActiveMessageModal(null)}
                className="px-4 py-2 text-xs rounded-lg bg-neutral-800 text-white hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Log New Update Entry</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Profile *</label>
                  <input
                    type="text"
                    required
                    value={formData.profile}
                    onChange={e => setFormData({ ...formData, profile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Client Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. brandi737"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Update By Staff</label>
                  <input
                    type="text"
                    value={formData.updateBy}
                    onChange={e => setFormData({ ...formData, updateBy: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Update To Channel</label>
                  <select
                    value={formData.updateTo}
                    onChange={e => setFormData({ ...formData, updateTo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Inbox Page">Inbox Page</option>
                    <option value="Inbox & Order">Inbox & Order</option>
                    <option value="Order Page">Order Page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Communication Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste what message was sent to client or summary of update..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Comment (Operation)</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Days Ex ..., Delivery A ..."
                    value={formData.commentOperation}
                    onChange={e => setFormData({ ...formData, commentOperation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Team Leader At (@TL)</label>
                  <input
                    type="text"
                    value={formData.tlAt}
                    onChange={e => setFormData({ ...formData, tlAt: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Comment (Sales)</label>
                <input
                  type="text"
                  placeholder="Sales notes, client flags or upsell details..."
                  value={formData.commentSales}
                  onChange={e => setFormData({ ...formData, commentSales: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
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
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Edit Update Entry</h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Message</label>
                <textarea
                  rows={3}
                  value={editingEntry.message}
                  onChange={e => setEditingEntry({ ...editingEntry, message: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Comment (Operation)</label>
                  <input
                    type="text"
                    value={editingEntry.commentOperation || ''}
                    onChange={e => setEditingEntry({ ...editingEntry, commentOperation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Comment (Sales)</label>
                  <input
                    type="text"
                    value={editingEntry.commentSales || ''}
                    onChange={e => setEditingEntry({ ...editingEntry, commentSales: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editTlCheck"
                  checked={editingEntry.tlCheck}
                  onChange={e => setEditingEntry({ ...editingEntry, tlCheck: e.target.checked })}
                  className="rounded bg-[#161b24] border-[#273244]"
                />
                <label htmlFor="editTlCheck" className="text-neutral-300">
                  TL Checked & Verified
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUpdate(editingEntry.id, editingEntry);
                    setEditingEntry(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
