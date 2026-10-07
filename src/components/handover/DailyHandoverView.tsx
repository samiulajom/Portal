import React, { useState } from 'react';
import { GitCompare, Plus, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { ShiftType } from '../../types';

export const DailyHandoverView: React.FC = () => {
  const { handovers, addHandover, acknowledgeHandover, user } = usePortal();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    fromShift: 'Morning Shift' as ShiftType,
    toShift: 'Night Shift' as ShiftType,
    notes: '',
    urgentTicketsText: 'QU-329851, iss-1'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.notes.trim()) return;

    const tickets = formData.urgentTicketsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addHandover({
      fromShift: formData.fromShift,
      toShift: formData.toShift,
      author: `${user.name} (${formData.fromShift})`,
      notes: formData.notes,
      urgentTickets: tickets
    });

    setFormData({
      fromShift: 'Morning Shift',
      toShift: 'Night Shift',
      notes: '',
      urgentTicketsText: ''
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Shift Handover</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Operational handover protocol between Morning, Evening, and Night developer teams.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Handover Log</span>
        </button>
      </div>

      {/* Handover Cards */}
      <div className="space-y-4">
        {handovers.map(ho => (
          <div
            key={ho.id}
            className="p-5 rounded-xl bg-[#0b0e14] border border-[#1a212c] hover:border-[#283244] transition-all space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#181f2b] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white px-2.5 py-1 rounded-md bg-[#161c28] border border-[#242f44]">
                  {ho.fromShift}
                </span>
                <span className="text-[#64748b] text-xs">➔</span>
                <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded-md bg-[#231d10] border border-amber-900/50">
                  {ho.toShift}
                </span>
                <span className="text-[11px] font-mono text-[#64748b] ml-2">
                  {ho.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    ho.status === 'Acknowledged'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  }`}
                >
                  {ho.status}
                </span>

                {ho.status !== 'Acknowledged' && (
                  <button
                    onClick={() => acknowledgeHandover(ho.id, user.name)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                  >
                    Acknowledge Handover
                  </button>
                )}
              </div>
            </div>

            {/* Handover note content */}
            <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {ho.notes}
            </p>

            {/* Urgent Tickets tag list */}
            {ho.urgentTickets && ho.urgentTickets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[#64748b] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Urgent Trackers:
                </span>
                {ho.urgentTickets.map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1b2230] text-amber-300 border border-[#2b374d]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom info */}
            <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-2 border-t border-[#181f2b]">
              <span>Handed Over By: <strong className="text-neutral-300 font-normal">{ho.author}</strong></span>
              <span>Acknowledged By: <strong className="text-neutral-300 font-normal">{ho.receivedBy || 'Pending'}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* New Handover Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Create Shift Handover Protocol</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Outgoing Shift</label>
                  <select
                    value={formData.fromShift}
                    onChange={e => setFormData({ ...formData, fromShift: e.target.value as ShiftType })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                    <option value="Night Shift">Night Shift</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Incoming Shift</label>
                  <select
                    value={formData.toShift}
                    onChange={e => setFormData({ ...formData, toShift: e.target.value as ShiftType })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Night Shift">Night Shift</option>
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Handover Brief & Crucial Instructions *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Summarize client updates, theme staging versions, pending orders, and who needs to be messaged..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1">Urgent Ticket / Queue IDs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. QU-329851, iss-2"
                  value={formData.urgentTicketsText}
                  onChange={e => setFormData({ ...formData, urgentTicketsText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181d26] text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                >
                  Submit Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
