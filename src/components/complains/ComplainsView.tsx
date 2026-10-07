import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert, 
  X,
  Trash2,
  Clock
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { ComplainItem, ComplainSeverity, ComplainStatus } from '../../types';

export const ComplainsView: React.FC = () => {
  const { complains, addComplain, updateComplainStatus, deleteComplain, user } = usePortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeResolutionModal, setActiveResolutionModal] = useState<ComplainItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    profileStore: 'sitewix_pro_Fiverr',
    category: 'Revision Conflict' as ComplainItem['category'],
    severity: 'Medium' as ComplainSeverity,
    status: 'Open' as ComplainStatus,
    description: '',
    assignedLead: 'Tuhin',
    orderUrl: ''
  });

  const filteredComplains = useMemo(() => {
    return complains.filter(c => {
      const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      if (!matchesSeverity || !matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.ticketNo.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.profileStore.toLowerCase().includes(q)
      );
    });
  }, [complains, severityFilter, statusFilter, searchQuery]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.description.trim()) return;

    addComplain({
      clientName: formData.clientName,
      profileStore: formData.profileStore,
      category: formData.category,
      severity: formData.severity,
      status: formData.status,
      description: formData.description,
      assignedLead: formData.assignedLead,
      reportedBy: `${user.name} (${user.role})`,
      orderUrl: formData.orderUrl
    });

    setFormData({
      clientName: '',
      profileStore: 'sitewix_pro_Fiverr',
      category: 'Revision Conflict',
      severity: 'Medium',
      status: 'Open',
      description: '',
      assignedLead: 'Tuhin',
      orderUrl: ''
    });
    setIsCreateModalOpen(false);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResolutionModal) return;
    updateComplainStatus(activeResolutionModal.id, 'Resolved', resolutionText);
    setActiveResolutionModal(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Client & Order Complaints</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Escalation management, revision disputes, and order cancellation mitigation.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-400 text-white flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>File Complaint</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c0f14] border border-[#1c222d]">
          <span className="text-xs text-[#94a3b8] block mb-1">Total Escalations</span>
          <span className="text-xl font-bold text-white font-mono">{complains.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c0f14] border border-[#1c222d]">
          <span className="text-xs text-[#94a3b8] block mb-1">Open / Under Review</span>
          <span className="text-xl font-bold text-amber-400 font-mono">
            {complains.filter(c => c.status === 'Open' || c.status === 'Under Investigation').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c0f14] border border-[#1c222d]">
          <span className="text-xs text-[#94a3b8] block mb-1">Critical Severity</span>
          <span className="text-xl font-bold text-red-400 font-mono">
            {complains.filter(c => c.severity === 'Critical').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c0f14] border border-[#1c222d]">
          <span className="text-xs text-[#94a3b8] block mb-1">Resolved Successfully</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            {complains.filter(c => c.status === 'Resolved').length}
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets, clients, or issues..."
            className="w-full pl-10 pr-4 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-[#64748b]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-neutral-300 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-neutral-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complains List */}
      <div className="space-y-3">
        {filteredComplains.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748b] bg-[#0c0f14] rounded-xl border border-dashed border-[#1c222d]">
            No complaint logs found.
          </div>
        ) : (
          filteredComplains.map(item => (
            <div
              key={item.id}
              className="p-4 lg:p-5 rounded-xl bg-[#0b0e14] border border-[#1a212c] hover:border-[#283244] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#181f2b] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {item.ticketNo}
                  </span>
                  <span className="text-white text-xs font-semibold">
                    {item.clientName}
                  </span>
                  <span className="text-[11px] font-mono text-[#64748b]">
                    ({item.profileStore})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#161d28] text-neutral-300">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.severity === 'Critical'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : item.severity === 'High'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}
                  >
                    {item.severity} Severity
                  </span>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-yellow-950 text-yellow-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-200 leading-relaxed">
                {item.description}
              </p>

              {/* Resolution Note if present */}
              {item.resolutionNote && (
                <div className="p-2.5 rounded-lg bg-[#0e1c15] border border-emerald-900/40 text-emerald-300 text-xs">
                  <span className="font-semibold block mb-0.5">Resolution Action:</span>
                  {item.resolutionNote}
                </div>
              )}

              {/* Bottom Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#64748b] pt-1">
                <div className="flex items-center gap-4">
                  <span>Assigned Lead: <strong className="text-neutral-300 font-normal">{item.assignedLead}</strong></span>
                  <span>Reported By: <strong className="text-neutral-300 font-normal">{item.reportedBy}</strong></span>
                  <span className="font-mono">{item.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.orderUrl && (
                    <a
                      href={item.orderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Order</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {item.status !== 'Resolved' && (
                    <button
                      onClick={() => setActiveResolutionModal(item)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                    >
                      Resolve Ticket
                    </button>
                  )}

                  <button
                    onClick={() => deleteComplain(item.id)}
                    className="p-1 text-[#64748b] hover:text-red-400 transition-colors"
                    title="Delete complaint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Complaint Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Log Client Complaint / Dispute</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Client Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. marleamb"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Store / Account</label>
                  <input
                    type="text"
                    value={formData.profileStore}
                    onChange={e => setFormData({ ...formData, profileStore: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Revision Conflict">Revision Conflict</option>
                    <option value="Late Delivery">Late Delivery Risk</option>
                    <option value="Communication Gap">Communication Gap</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Order Cancellation Risk">Cancellation Threat</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Complaint Detail & Client Statement *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain exactly what the buyer is unhappy with and what is needed..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Assigned Lead / Handler</label>
                  <input
                    type="text"
                    value={formData.assignedLead}
                    onChange={e => setFormData({ ...formData, assignedLead: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Order URL</label>
                  <input
                    type="url"
                    placeholder="https://fiverr.com/orders/..."
                    value={formData.orderUrl}
                    onChange={e => setFormData({ ...formData, orderUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
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
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {activeResolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Resolve {activeResolutionModal.ticketNo}</h3>
              <button onClick={() => setActiveResolutionModal(null)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Resolution Summary / Prevention Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What was done to resolve the issue and satisfy the client?"
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setActiveResolutionModal(null)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
