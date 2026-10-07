import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  RotateCw, 
  Trash2, 
  Search, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  X,
  MessageSquare
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { QueueItem, QueueStatus } from '../../types';

export const QueueView: React.FC = () => {
  const { queues, addQueue, updateQueueStatus, deleteQueue, deleteAllQueues, user } = usePortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    profileStore: 'ecom_store3_fiverr',
    title: '',
    salesPerson: 'Shishir chowdhory',
    conversationUrl: '',
    notes: '',
    status: 'Requested' as QueueStatus
  });

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  // Calculate counters matching Screenshot 1
  const totalCount = queues.length;
  const requestedCount = queues.filter(q => q.status === 'Requested').length;
  const givenCount = queues.filter(q => q.status === 'Given').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  // Filtered queues
  const filteredQueues = useMemo(() => {
    return queues.filter(q => {
      const matchesStatus = statusFilter === 'All Status' || q.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        q.clientName.toLowerCase().includes(term) ||
        q.profileStore.toLowerCase().includes(term) ||
        q.queueKey.toLowerCase().includes(term) ||
        q.title.toLowerCase().includes(term) ||
        q.salesPerson.toLowerCase().includes(term)
      );
    });
  }, [queues, statusFilter, searchQuery]);

  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.title.trim()) return;

    addQueue({
      status: formData.status,
      clientName: formData.clientName,
      profileStore: formData.profileStore,
      title: formData.title,
      conversationUrl: formData.conversationUrl || 'https://fiverr.com/inbox/' + formData.clientName,
      submittedBy: user.name,
      salesPerson: formData.salesPerson,
      notes: formData.notes
    });

    setFormData({
      clientName: '',
      profileStore: 'ecom_store3_fiverr',
      title: '',
      salesPerson: 'Shishir chowdhory',
      conversationUrl: '',
      notes: '',
      status: 'Requested'
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Row Matching Screenshot 1 Exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Queue</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Your submitted queue requests</p>
        </div>

        {/* Action Buttons: Refresh, + Create Queue, Delete All */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-[#11141c] hover:bg-[#181d27] border border-[#1e2531] text-[#94a3b8] hover:text-white transition-colors"
            title="Refresh queues"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Create Queue</span>
          </button>

          <button
            onClick={handleDeleteAll}
            disabled={queues.length === 0}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#11141c] hover:bg-red-950/30 border border-[#1e2531] hover:border-red-900/50 text-[#94a3b8] hover:text-red-400 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            title="Delete All Requests"
          >
            <span>Delete All</span>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Boxes Matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-[#0c0f14] border border-[#1c222d] rounded-xl p-5">
          <span className="text-xs text-[#94a3b8] block mb-1">Total</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{totalCount}</span>
        </div>

        {/* Requested */}
        <div className="bg-[#0c0f14] border border-[#1c222d] rounded-xl p-5">
          <span className="text-xs text-[#94a3b8] block mb-1">Requested</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{requestedCount}</span>
        </div>

        {/* Given */}
        <div className="bg-[#0c0f14] border border-[#1c222d] rounded-xl p-5">
          <span className="text-xs text-[#94a3b8] block mb-1">Given</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{givenCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar Matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client name, order ID, or queue key..."
            className="w-full pl-10 pr-4 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-[#64748b]"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Given">Given</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-[#64748b] pointer-events-none" />
        </div>
      </div>

      {/* Queue Cards Grid Matching Screenshot 1 Exactly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueues.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#64748b] bg-[#0c0f14] rounded-xl border border-dashed border-[#1c222d]">
            No queue requests found. Click "+ Create Queue" to submit a live assist request.
          </div>
        ) : (
          filteredQueues.map(item => (
            <div
              key={item.id}
              className="bg-[#0b0e14] border border-[#1a212c] rounded-xl p-5 space-y-3.5 transition-all hover:border-[#273244] shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: # QU-329851 + Given pill badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-neutral-300">
                    # {item.queueKey}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.status === 'Given'
                          ? 'bg-[#143222] text-[#4ade80] border-[#22c55e]/40'
                          : item.status === 'Requested'
                          ? 'bg-[#372d13] text-[#facc15] border-[#eab308]/40'
                          : 'bg-[#152336] text-[#60a5fa] border-[#3b82f6]/40'
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Quick status switch dropdown */}
                    <select
                      value={item.status}
                      onChange={e => updateQueueStatus(item.id, e.target.value as QueueStatus)}
                      className="text-[10px] bg-[#141822] text-[#94a3b8] rounded border border-[#232b3b] px-1 py-0.5 focus:outline-none"
                    >
                      <option value="Requested">Requested</option>
                      <option value="Given">Given</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Second Row: User icon + client username + store name */}
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <User className="w-3.5 h-3.5 text-[#64748b]" />
                  <span className="font-semibold text-white">{item.clientName}</span>
                  <span className="text-[#64748b] font-mono text-[11px]">
                    {item.profileStore}
                  </span>
                </div>

                {/* Third Row: Title / summary */}
                <p className="text-sm font-semibold text-white tracking-tight">
                  {item.title}
                </p>

                {/* Optional notes */}
                {item.notes && (
                  <p className="text-xs text-[#94a3b8] line-clamp-2">
                    {item.notes}
                  </p>
                )}

                {/* Fourth Row: Conversation Button */}
                <div>
                  <a
                    href={item.conversationUrl || `https://fiverr.com/inbox/${item.clientName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111622] hover:bg-[#182030] border border-[#212b3d] text-xs text-[#93c5fd] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Conversation</span>
                  </a>
                </div>
              </div>

              {/* Footer Row Matching Screenshot 1 */}
              <div className="pt-3 border-t border-[#181f2b] flex items-center justify-between text-[11px] text-[#64748b]">
                <div className="truncate pr-2">
                  <span>By <strong className="text-neutral-300 font-normal">{item.submittedBy}</strong></span>
                  <span className="ml-1.5">Sales: <strong className="text-neutral-300 font-normal">{item.salesPerson}</strong></span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="whitespace-nowrap">{item.createdAt}</span>
                  <button
                    onClick={() => deleteQueue(item.id)}
                    className="text-[#64748b] hover:text-red-400 transition-colors p-1"
                    title="Delete queue"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Queue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Submit New Queue Request</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQueue} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Client Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. christinaslo"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Store / Account Profile</label>
                  <input
                    type="text"
                    value={formData.profileStore}
                    onChange={e => setFormData({ ...formData, profileStore: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Sales Person Rep</label>
                  <input
                    type="text"
                    value={formData.salesPerson}
                    onChange={e => setFormData({ ...formData, salesPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Task Summary / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. inbox page update, urgent layout fix"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Conversation / Order URL</label>
                <input
                  type="url"
                  placeholder="https://fiverr.com/inbox/..."
                  value={formData.conversationUrl}
                  onChange={e => setFormData({ ...formData, conversationUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as QueueStatus })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                >
                  <option value="Requested">Requested (Waiting for assignment)</option>
                  <option value="Given">Given (Assigned to Developer)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200"
                >
                  Submit Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Queues In-App Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0f131a] border border-[#273244] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete All Queues?</h3>
                <p className="text-xs text-[#94a3b8]">Clear all submitted queue requests</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#151214] p-3 rounded-xl border border-red-900/30">
              Are you sure you want to permanently delete all <strong className="text-white font-bold">{queues.length}</strong> queue requests?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAllQueues();
                  setIsDeleteAllModalOpen(false);
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
