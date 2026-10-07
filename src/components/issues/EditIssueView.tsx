import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Link as LinkIcon, 
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { IssueItem, RiskLevel, ServiceType, TeamType, AttachmentUrlItem } from '../../types';
import { AVAILABLE_SERVICES, AVAILABLE_TEAMS } from './IssueSheetView';

interface EditIssueViewProps {
  issue: IssueItem;
  onSave: (updatedIssue: IssueItem) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  availableProfiles: string[];
}

export const EditIssueView: React.FC<EditIssueViewProps> = ({
  issue,
  onSave,
  onBack,
  onDelete,
  availableProfiles
}) => {
  const [clientName, setClientName] = useState(issue.clientName || '');
  const [orderId, setOrderId] = useState(issue.orderId || '');
  const [profile, setProfile] = useState(issue.profile || (availableProfiles[0] || 'ecom_store3_Fiverr'));
  const [service, setService] = useState<ServiceType>(issue.service || 'CMS');
  const [team, setTeam] = useState<TeamType>(issue.team || 'Shopify_Zen');
  const [orderPageUrl, setOrderPageUrl] = useState(issue.orderPageUrl || '');
  const [inboxPageUrl, setInboxPageUrl] = useState(issue.inboxPageUrl || '');
  const [specialNotes, setSpecialNotes] = useState(issue.specialNotes || '');
  const [fileMeetingLink, setFileMeetingLink] = useState(issue.fileMeetingLink || '');
  const [assignedPerson, setAssignedPerson] = useState(issue.assignedPerson || '');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(issue.riskLevel || 'Low');
  const [salesNote, setSalesNote] = useState(issue.salesNote || '');
  const [status, setStatus] = useState(issue.status || 'open');
  const [resolutionNote, setResolutionNote] = useState(issue.resolutionNote || '');

  // Dynamic additional attachment URLs
  const [attachmentUrls, setAttachmentUrls] = useState<AttachmentUrlItem[]>(
    issue.attachmentUrls && issue.attachmentUrls.length > 0
      ? issue.attachmentUrls
      : []
  );
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddAttachment = () => {
    const newItem: AttachmentUrlItem = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: '',
      url: ''
    };
    setAttachmentUrls(prev => [...prev, newItem]);
  };

  const handleUpdateAttachment = (id: string, field: 'label' | 'url', value: string) => {
    setAttachmentUrls(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachmentUrls(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Client Name is required');
      return;
    }
    setErrorMessage(null);

    // Clean attachment URLs
    const cleanedAttachments = attachmentUrls.filter(a => a.url.trim() !== '');

    const updated: IssueItem = {
      ...issue,
      clientName: clientName.trim(),
      orderId: orderId.trim(),
      profile,
      service,
      team,
      orderPageUrl: orderPageUrl.trim(),
      inboxPageUrl: inboxPageUrl.trim(),
      specialNotes: specialNotes.trim(),
      fileMeetingLink: fileMeetingLink.trim(),
      assignedPerson: assignedPerson.trim(),
      riskLevel,
      salesNote: salesNote.trim(),
      status,
      resolutionNote: status === 'done' ? resolutionNote.trim() : issue.resolutionNote,
      attachmentUrls: cleanedAttachments
    };

    onSave(updated);
  };

  const riskOptions: { level: RiskLevel; label: string; dotColor: string; activeColor: string }[] = [
    { level: 'Low', label: 'Low', dotColor: 'bg-emerald-400', activeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
    { level: 'Medium', label: 'Medium', dotColor: 'bg-yellow-400', activeColor: 'border-yellow-500 bg-yellow-950/40 text-yellow-300' },
    { level: 'High', label: 'High', dotColor: 'bg-orange-400', activeColor: 'border-orange-500 bg-orange-950/40 text-orange-300' },
    { level: 'Critical', label: 'Critical', dotColor: 'bg-red-400', activeColor: 'border-red-500 bg-red-950/40 text-red-300' }
  ];

  return (
    <div className="space-y-7 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header Matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1b222d]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Edit Issue</h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-2xl leading-relaxed">
            Update the details of this issue. Make sure to provide clear information so the operations team can effectively review and resolve the issue.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors font-medium self-start sm:self-auto cursor-pointer group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back to the sheet</span>
        </button>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ROW 1: Client Name | Order Id | Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Client Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. fafo101"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>

          {/* Order Id */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Order Id</label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="ex: FO72EC86A2647"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] font-mono focus:outline-none transition-colors"
            />
          </div>

          {/* Profile Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Profile</label>
            <div className="relative">
              <select
                value={profile}
                onChange={e => setProfile(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                {availableProfiles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-[#64748b]">
                <span className="text-[10px] block leading-none">▲</span>
                <span className="text-[10px] block leading-none">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Service Line | Order Page URL | Inbox Page URL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Line */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Service Line</label>
            <div className="relative">
              <select
                value={service}
                onChange={e => setService(e.target.value as ServiceType)}
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                {AVAILABLE_SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#64748b]">
                <span className="text-[11px]">▼</span>
              </div>
            </div>
          </div>

          {/* Order Page URL */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Order Page URL</label>
            <input
              type="text"
              value={orderPageUrl}
              onChange={e => setOrderPageUrl(e.target.value)}
              placeholder="paste google drive link"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>

          {/* Inbox Page URL */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Inbox Page URL</label>
            <input
              type="text"
              value={inboxPageUrl}
              onChange={e => setInboxPageUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/19F0vVAC-M67x7EaUZLgxrhYNN1Y-1HCn"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ROW 3: Special Notes | File/Meeting Link | Assigned Person | RISK LEVEL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Special Notes */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Special Notes</label>
            <input
              type="text"
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder="ex: Scheduled meeting at 12 Sep, 2025 at 9:00 AM"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>

          {/* File/Meeting Link (If any) */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">File/Meeting Link (If any)</label>
            <input
              type="text"
              value={fileMeetingLink}
              onChange={e => setFileMeetingLink(e.target.value)}
              placeholder="ex: Paste google file url"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>

          {/* Assigned Person */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Assigned Person</label>
            <input
              type="text"
              value={assignedPerson}
              onChange={e => setAssignedPerson(e.target.value)}
              placeholder="ex: Monir/Adnan"
              className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
            />
          </div>

          {/* RISK LEVEL * (Pill group matching Screenshot exactly) */}
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">
              RISK LEVEL <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {riskOptions.map(opt => {
                const isSelected = riskLevel === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setRiskLevel(opt.level)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${opt.activeColor} shadow-xs font-semibold`
                        : 'border-[#1e2533] bg-[#0b0e14] text-neutral-400 hover:text-white hover:border-[#2e394d]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 4: Note for Sales (Full width) */}
        <div className="space-y-1.5">
          <label className="text-[#94a3b8] font-medium block">Note for Sales</label>
          <input
            type="text"
            value={salesNote}
            onChange={e => setSalesNote(e.target.value)}
            placeholder="ex: Please arrange a meeting"
            className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-[#1e2533] focus:border-amber-500/70 rounded-xl text-white placeholder:text-[#475569] focus:outline-none transition-colors"
          />
        </div>

        {/* ROW 5: Assigned Team & Status (Existing system fields) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0c1017] border border-[#1a2230]">
          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Assigned Team</label>
            <select
              value={team}
              onChange={e => setTeam(e.target.value as TeamType)}
              className="w-full px-3.5 py-2 bg-[#121620] border border-[#232d3f] rounded-xl text-white focus:outline-none"
            >
              {AVAILABLE_TEAMS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#94a3b8] font-medium block">Issue Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-[#121620] border border-[#232d3f] rounded-xl text-white focus:outline-none font-medium"
            >
              <option value="open">open</option>
              <option value="in progress">in progress</option>
              <option value="done">done</option>
            </select>
          </div>

          {status === 'done' && (
            <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-[#1e2736]">
              <label className="text-emerald-400 font-semibold block">
                Work Done / Resolution Note (কি কাজ করেছেন তার বিবরণ):
              </label>
              <textarea
                rows={2}
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="যেমন: Liquid ফাইলের বাগ ফিক্স করেছি এবং ক্লায়েন্টকে ইনবক্সে জানিয়েছি..."
                className="w-full px-3.5 py-2 bg-[#121620] border border-emerald-900/60 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-[#475569]"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ROW 6: ADDITIONAL ATTACHMENT URLS (USER'S EXPLICIT REQUEST)               */}
        {/* "onk somoy onk gulo url jog kora lge tai ai gulo sarao akta option         */}
        {/*  rakhhba jate aro attchemtn url jog kort pari"                            */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0e14] border border-[#1b2331] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#18202d]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Paperclip className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Additional Attachment URLs (অতিরিক্ত ফাইল / লিঙ্ক সমূহ)
                </h4>
                <p className="text-[11px] text-[#64748b]">
                  Loom ভিডিও, ফিগমা, গুগল শিট, ড্রাইভ ফোল্ডার বা স্ক্রিনশটের একাধিক লিঙ্ক এখানে যোগ করুন
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddAttachment}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#18202d] hover:bg-[#202b3d] text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Attachment URL</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#64748b]">Quick Type:</span>
            {[
              { label: 'Figma UI', icon: '🎨' },
              { label: 'Loom Video', icon: '🎥' },
              { label: 'Google Drive', icon: '📁' },
              { label: 'Google Sheet', icon: '📊' },
              { label: 'Screenshot', icon: '🖼️' },
              { label: 'Meeting Link', icon: '📞' }
            ].map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const newItem: AttachmentUrlItem = {
                    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    label: preset.label,
                    url: ''
                  };
                  setAttachmentUrls(prev => [...prev, newItem]);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#141924] hover:bg-[#1c2433] text-[#cbd5e1] border border-[#222c3d] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{preset.icon}</span>
                <span>+ {preset.label}</span>
              </button>
            ))}
          </div>

          {attachmentUrls.length === 0 ? (
            <div className="py-5 text-center text-[#64748b] border border-dashed border-[#1c2433] rounded-xl text-xs space-y-1">
              <p>কোনো অতিরিক্ত লিঙ্ক যোগ করা হয়নি।</p>
              <p className="text-[11px] text-[#475569]">
                প্রয়োজন হলে উপরে কুইক টাইপ চিপসে ক্লিক করুন বা <strong className="text-amber-400 font-normal">"+ Add Attachment URL"</strong> বাটনে ক্লিক করে যত খুশি লিঙ্ক যোগ করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {attachmentUrls.map((att, idx) => (
                <div 
                  key={att.id} 
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-[#10141d] border border-[#1c2433] animate-fadeIn"
                >
                  <span className="text-[10px] font-mono text-[#64748b] px-1.5 py-0.5 rounded bg-[#161c28] shrink-0 self-start sm:self-auto">
                    #{idx + 1}
                  </span>

                  {/* Label / Title Input */}
                  <div className="sm:w-1/3">
                    <input
                      type="text"
                      value={att.label}
                      onChange={e => handleUpdateAttachment(att.id, 'label', e.target.value)}
                      placeholder="Title: Figma / Loom / Drive..."
                      className="w-full px-3 py-1.5 bg-[#151a24] border border-[#232c3d] rounded-lg text-white placeholder:text-[#475569] text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* URL Input */}
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={att.url}
                      onChange={e => handleUpdateAttachment(att.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-[#151a24] border border-[#232c3d] rounded-lg text-white placeholder:text-[#475569] text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Action buttons */}
                  {/* Delete Attachment Button */}
                  <div className="flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 border border-red-900/50 transition-colors cursor-pointer"
                      title="Remove Attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR MATCHING SCREENSHOT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1b222d]">
          {/* Delete Issue Option */}
          <button
            type="button"
            onClick={() => setIsDeletingModalOpen(true)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Issue</span>
          </button>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs rounded-xl bg-[#121620] hover:bg-[#181d2a] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Save Now Button (Matching Screenshot: White button, bold text) */}
            <button
              type="submit"
              className="px-6 py-2.5 text-xs rounded-xl bg-white hover:bg-neutral-200 text-black font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Now</span>
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation In-App Modal (Never uses window.confirm) */}
      {isDeletingModalOpen && (
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

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete the issue for <strong className="text-white font-semibold">"{clientName || issue.clientName}"</strong>{orderId ? ` (Order: ${orderId})` : ''}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIsDeletingModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeletingModalOpen(false);
                  onDelete(issue.id);
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Issue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
