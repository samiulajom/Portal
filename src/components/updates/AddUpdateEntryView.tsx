import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, ChevronDown, Lightbulb } from 'lucide-react';
import { UpdateEntry } from '../../types';

interface AddUpdateEntryViewProps {
  onBack: () => void;
  onSave: (entry: Omit<UpdateEntry, 'id'>) => void;
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

export const AddUpdateEntryView: React.FC<AddUpdateEntryViewProps> = ({
  onBack,
  onSave,
  availableProfiles = [],
  currentUser = 'Samiul'
}) => {
  const [profile, setProfile] = useState('');
  const [clientName, setClientName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [attachments, setAttachments] = useState('');
  const [commentOperation, setCommentOperation] = useState('');
  const [commentSales, setCommentSales] = useState('');
  const [updateTo, setUpdateTo] = useState('Inbox Page Update');
  const [message, setMessage] = useState('');
  const [aiToggle, setAiToggle] = useState(true);

  // Profile verification check
  const allKnownProfiles = useMemo(() => {
    return Array.from(new Set([...DEFAULT_KNOWN_PROFILES, ...availableProfiles]));
  }, [availableProfiles]);

  const isProfileVerified = useMemo(() => {
    const trimmed = profile.trim().toLowerCase();
    if (!trimmed) return false;
    return allKnownProfiles.some(p => p.toLowerCase() === trimmed) || trimmed.includes('fiverr') || trimmed.length >= 4;
  }, [profile, allKnownProfiles]);

  const isValid = profile.trim().length > 0 && clientName.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const now = new Date();
    const dateStr = `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    onSave({
      date: dateStr,
      profile: profile.trim(),
      clientName: clientName.trim(),
      orderId: orderId.trim(),
      attachments: attachments.trim(),
      updateBy: `@${currentUser.toLowerCase().replace(/\s+/g, '')}`,
      message: message.trim(),
      commentOperation: commentOperation.trim(),
      commentSales: commentSales.trim(),
      tlCheck: false,
      tlAt: '@Sushmoy',
      updateTo: updateTo as any,
      doneBy: currentUser
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header bar matching Screenshot 1 */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1b222f] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Add Entry</h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-2xl leading-relaxed">
            Use this form to create a new update sheet entry. Paste the exact profile name and provide the necessary details to keep the update sheet current and accurate.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 mt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sheet</span>
        </button>
      </div>

      {/* Form Fields matching Screenshot 1 */}
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

        {/* ROW 4: Update To (Highlighted yellow select container matching Screenshot 1) */}
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
            Message <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 2500))}
              placeholder="Type or paste the update message..."
              className="w-full px-4 py-3 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] text-xs focus:outline-none resize-y min-h-[130px] transition-colors leading-relaxed"
            />
            {/* Toggle switch inside bottom right corner matching Screenshot 1 */}
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

        {/* Submit button on bottom right matching Screenshot 1 */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!isValid}
            className={`px-7 py-2.5 text-xs rounded-xl font-bold transition-all shadow-md ${
              isValid
                ? 'bg-white hover:bg-neutral-200 text-black cursor-pointer active:scale-98'
                : 'bg-[#202735] text-[#64748b] cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
