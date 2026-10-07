import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, ChevronDown, Trash2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { UpdateEntry } from '../../types';

interface EditUpdateEntryViewProps {
  entry: UpdateEntry;
  onBack: () => void;
  onSave: (updated: UpdateEntry) => void;
  onDelete: (id: string) => void;
  onSendComplete?: (updated: UpdateEntry) => void;
  availableProfiles?: string[];
  currentUser?: string;
}

const DEFAULT_KNOWN_PROFILES = [
  'ecom_store3_Fiverr',
  'web_mania_Fiverr',
  'pagetecho_Fiverr',
  'ppc_buddy_Fiverr',
  'sitewix_pro_Fiverr',
  'smmtech_Fiverr',
  'shopify_zen_Fiverr',
  'wp_titans_Fiverr'
];

export const EditUpdateEntryView: React.FC<EditUpdateEntryViewProps> = ({
  entry,
  onBack,
  onSave,
  onDelete,
  onSendComplete,
  availableProfiles = [],
  currentUser = 'Samiul'
}) => {
  const [profile, setProfile] = useState(entry.profile || '');
  const [clientName, setClientName] = useState(entry.clientName || '');
  const [orderId, setOrderId] = useState(entry.orderId || '');
  const [attachments, setAttachments] = useState(entry.attachments || '');
  const [commentOperation, setCommentOperation] = useState(entry.commentOperation || '');
  const [commentSales, setCommentSales] = useState(entry.commentSales || '');
  const [updateTo, setUpdateTo] = useState(entry.updateTo || 'Inbox Page Update');
  const [message, setMessage] = useState(entry.message || '');
  const [aiToggle, setAiToggle] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile verification check
  const allKnownProfiles = useMemo(() => {
    return Array.from(new Set([...DEFAULT_KNOWN_PROFILES, ...availableProfiles]));
  }, [availableProfiles]);

  const isProfileVerified = useMemo(() => {
    const trimmed = profile.trim().toLowerCase();
    if (!trimmed) return false;
    return allKnownProfiles.some(p => p.toLowerCase() === trimmed) || trimmed.includes('fiverr') || trimmed.length >= 4;
  }, [profile, allKnownProfiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !profile.trim()) return;

    onSave({
      ...entry,
      profile: profile.trim(),
      clientName: clientName.trim(),
      orderId: orderId.trim(),
      attachments: attachments.trim(),
      commentOperation: commentOperation.trim(),
      commentSales: commentSales.trim(),
      updateTo: updateTo as any,
      message: message.trim()
    });
  };

  // Handler for Mark as Sent / Complete button
  const handleSendComplete = () => {
    if (!clientName.trim() || !profile.trim()) return;
    const now = new Date();
    const sentTimeStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const updated: UpdateEntry = {
      ...entry,
      profile: profile.trim(),
      clientName: clientName.trim(),
      orderId: orderId.trim(),
      attachments: attachments.trim(),
      commentOperation: commentOperation.trim(),
      commentSales: commentSales.trim(),
      updateTo: updateTo as any,
      message: message.trim(),
      status: 'completed',
      sentAt: sentTimeStr,
      sentBy: currentUser
    };

    if (onSendComplete) {
      onSendComplete(updated);
    } else {
      onSave(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header bar matching Screenshot 2 */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1b222f] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Edit Entry</h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-2xl leading-relaxed">
            Use this form to edit an existing sheet entry. Paste the exact profile name and provide the necessary details to keep the update sheet current and accurate.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 mt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to the sheet</span>
        </button>
      </div>

      {/* Form Fields matching Screenshot 2 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ROW 1: Profile (with verified status), Client Name, Order Id */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 block">
              Profile <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={profile}
                onChange={e => setProfile(e.target.value)}
                placeholder="Paste the exact profile name"
                className={`w-full px-3.5 py-2.5 bg-[#0b0e14] border rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none transition-colors ${
                  isProfileVerified ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-[#1e2533] focus:border-amber-500/70'
                }`}
              />
              {isProfileVerified && (
                <Check className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
              )}
            </div>
            {isProfileVerified ? (
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                Profile verified.
              </p>
            ) : (
              <p className="text-[11px] text-[#64748b]">
                Enter the profile name shared with you. Names are not listed for privacy.
              </p>
            )}
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 block">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. christinaslo"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Order Id */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 block">
              Order Id
            </label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. FO2E10297142"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs font-mono focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ROW 2: Attachments (Full width) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            Attachments
          </label>
          <input
            type="text"
            value={attachments}
            onChange={e => setAttachments(e.target.value)}
            placeholder="Paste Google Drive, screenshot, Figma, or Loom links"
            className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none transition-colors"
          />
        </div>

        {/* ROW 3: Comment from Operation, Comment from Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 block">
              Comment from Operation
            </label>
            <input
              type="text"
              value={commentOperation}
              onChange={e => setCommentOperation(e.target.value)}
              placeholder="e.g. 15 Days Ex ..., Delivery A ..."
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 block">
              Comment from Sales
            </label>
            <input
              type="text"
              value={commentSales}
              onChange={e => setCommentSales(e.target.value)}
              placeholder="Sales note, revision request details or notes"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ROW 4: Update To (Highlighted yellow select container matching Screenshot 2) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            Update To
          </label>
          <div className="relative">
            <select
              value={updateTo}
              onChange={e => setUpdateTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#fef9c3] hover:bg-[#fef08a] border border-[#fde047] rounded-xl text-[#713f12] text-xs font-medium focus:outline-none appearance-none cursor-pointer shadow-xs transition-colors"
            >
              <option value="Inbox Page Update">Inbox Page Update</option>
              <option value="Order Page Update">Order Page Update</option>
              <option value="Inbox & Order Update">Inbox & Order Update</option>
              <option value="Revision Update">Revision Update</option>
              <option value="Query Update">Query Update</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#713f12] absolute right-4 top-3 pointer-events-none" />
          </div>
        </div>

        {/* ROW 5: Message with character counter & toggle switch */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            Message
          </label>
          <div className="relative">
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 2500))}
              placeholder="Type or paste the update message..."
              className="w-full px-4 py-3 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none resize-y min-h-[130px] transition-colors leading-relaxed"
            />
            {/* Toggle switch inside bottom right corner matching Screenshot 2 */}
            <div className="absolute right-3 bottom-3 flex items-center">
              <button
                type="button"
                onClick={() => setAiToggle(!aiToggle)}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  aiToggle ? 'bg-emerald-600 justify-end' : 'bg-[#1e2533] justify-start'
                }`}
                title="AI Assistant / Format Check"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <Lightbulb className={`w-3 h-3 ${aiToggle ? 'text-emerald-700' : 'text-neutral-500'}`} />
                </div>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>{message.length} of 2500 characters used</span>
          </div>
        </div>

        {/* Bottom Actions: Red Delete button + White Save Now button + Emerald Send & Complete button */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
          {/* Delete Button (Red with Trash icon) */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 text-xs rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Save Now Button (White with bold black text) */}
          <button
            type="submit"
            className="px-6 py-2 text-xs rounded-xl bg-white hover:bg-neutral-200 text-black font-bold transition-all shadow-md cursor-pointer active:scale-98"
          >
            Save Now
          </button>

          {/* Send & Complete Button */}
          <button
            type="button"
            onClick={handleSendComplete}
            className="px-5 py-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-98"
            title="Mark as Sent & Move to Completed list"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{entry.status === 'completed' ? 'Update & Keep Sent' : 'Send & Complete'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation In-App Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0f131a] border border-[#273244] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Entry?</h3>
                <p className="text-xs text-[#94a3b8]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete the update entry for{' '}
              <strong className="text-white font-semibold">"{clientName || entry.clientName}"</strong>
              {orderId ? ` (Order: ${orderId})` : ''}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onDelete(entry.id);
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md active:scale-98"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
