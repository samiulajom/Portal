import React, { useState } from 'react';
import { 
  X, 
  Paperclip, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  FileText, 
  Video, 
  Folder, 
  Image as ImageIcon, 
  Table as TableIcon,
  ShoppingBag,
  MessageSquare,
  Globe,
  Sparkles
} from 'lucide-react';
import { IssueItem, AttachmentUrlItem } from '../../types';

interface AttachmentHubModalProps {
  issue: IssueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateIssue: (issueId: string, updated: Partial<IssueItem>) => void;
}

export const AttachmentHubModal: React.FC<AttachmentHubModalProps> = ({
  issue,
  isOpen,
  onClose,
  onUpdateIssue
}) => {
  if (!isOpen || !issue) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preset chips for quick link creation
  const PRESET_TYPES = [
    { label: 'Figma UI', icon: '🎨' },
    { label: 'Loom Video', icon: '🎥' },
    { label: 'Google Drive', icon: '📁' },
    { label: 'Google Sheet', icon: '📊' },
    { label: 'Screenshot', icon: '🖼️' },
    { label: 'Meeting Link', icon: '📞' }
  ];

  // Helper to determine link icon based on url / label
  const getLinkIcon = (url: string, label: string) => {
    const lower = `${url} ${label}`.toLowerCase();
    if (lower.includes('figma')) return <span className="text-purple-400 font-bold text-xs">FIG</span>;
    if (lower.includes('loom') || lower.includes('video') || lower.includes('youtube')) return <Video className="w-4 h-4 text-rose-400" />;
    if (lower.includes('drive.google') || lower.includes('folder') || lower.includes('dropbox')) return <Folder className="w-4 h-4 text-amber-400" />;
    if (lower.includes('sheets') || lower.includes('docs.google.com/spreadsheets') || lower.includes('excel')) return <TableIcon className="w-4 h-4 text-emerald-400" />;
    if (lower.includes('prnt.sc') || lower.includes('gyazo') || lower.includes('image') || lower.includes('screenshot')) return <ImageIcon className="w-4 h-4 text-sky-400" />;
    if (lower.includes('order')) return <ShoppingBag className="w-4 h-4 text-orange-400" />;
    if (lower.includes('inbox') || lower.includes('message')) return <MessageSquare className="w-4 h-4 text-blue-400" />;
    return <Globe className="w-4 h-4 text-teal-400" />;
  };

  // Compile attachments: focus on user-added attachment files & resources
  const allAttachments: {
    id: string;
    type: 'custom';
    category: string;
    label: string;
    url: string;
    isDeletable: boolean;
  }[] = [];

  if (issue.attachmentUrls && issue.attachmentUrls.length > 0) {
    issue.attachmentUrls.forEach(att => {
      allAttachments.push({
        id: att.id,
        type: 'custom',
        category: 'Attachment',
        label: att.label || 'Reference Link',
        url: att.url,
        isDeletable: true
      });
    });
  }

  // Filter attachments by search
  const filteredAttachments = allAttachments.filter(item =>
    item.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Handle adding new attachment
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newItem: AttachmentUrlItem = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: newLabel.trim() || 'Reference Link',
      url: newUrl.trim()
    };

    const updatedList = [...(issue.attachmentUrls || []), newItem];
    onUpdateIssue(issue.id, { attachmentUrls: updatedList });

    setNewLabel('');
    setNewUrl('');
    setIsAddingNew(false);
  };

  // Handle deleting custom attachment (Direct removal, never blocked by window.confirm)
  const handleDeleteCustom = (attId: string) => {
    const updatedList = (issue.attachmentUrls || []).filter(a => a.id !== attId);
    onUpdateIssue(issue.id, { attachmentUrls: updatedList });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-[#0b0e14] border border-[#212937] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1b222f] flex items-center justify-between bg-[#0e121a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Attachments & Resources
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {allAttachments.length} {allAttachments.length === 1 ? 'Link' : 'Links'}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Client: <strong className="text-white font-medium">{issue.clientName}</strong>
                {issue.orderId && <span className="font-mono text-[#cbd5e1] ml-2">({issue.orderId})</span>}
                <span className="mx-2 text-[#475569]">•</span>
                Store: <span className="text-amber-300 font-mono">{issue.profile}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1c2433] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & + Add Link trigger */}
        <div className="p-4 border-b border-[#171d27] bg-[#0c1017] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search links by label or URL..."
            className="px-3 py-1.5 bg-[#121620] border border-[#222c3d] rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-amber-500 sm:w-64"
          />

          <button
            type="button"
            onClick={() => setIsAddingNew(prev => !prev)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isAddingNew ? 'Hide Form' : 'Add New Link'}</span>
          </button>
        </div>

        {/* Inline Add Form */}
        {isAddingNew && (
          <form onSubmit={handleAddNew} className="p-4 bg-[#111622] border-b border-[#212b3c] space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Add New Link</span>
              </span>
              <span className="text-[11px] text-[#64748b]">Select preset or type custom</span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TYPES.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setNewLabel(preset.label)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    newLabel === preset.label 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60' 
                      : 'bg-[#151b26] text-[#94a3b8] border-[#222a3a] hover:text-white'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1">Label / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Figma UI Design"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0b0e14] border border-[#273244] rounded-lg text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-[#94a3b8] block mb-1">Full URL *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#0b0e14] border border-[#273244] rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold shrink-0 transition-colors"
                  >
                    Save Link
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Attachments List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {filteredAttachments.length === 0 ? (
            <div className="py-12 text-center text-[#64748b] border border-dashed border-[#1c2433] rounded-2xl space-y-2">
              <Paperclip className="w-8 h-8 mx-auto text-[#475569] opacity-60" />
              <p className="text-sm font-semibold text-neutral-300">No attachments found</p>
              <p className="text-xs text-[#64748b]">
                {searchFilter ? 'Try a different search term.' : 'Click "Add New Link" above to add Loom, Figma, Drive, or Screenshots.'}
              </p>
            </div>
          ) : (
            filteredAttachments.map((item, idx) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#0f131b] hover:bg-[#141924] border border-[#1d2535] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs"
                >
                  {/* Left: Icon + Title + URL */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#18202d] border border-[#273447] flex items-center justify-center shrink-0 mt-0.5">
                      {getLinkIcon(item.url, item.label)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-xs truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-[#192231] text-[#93c5fd] border border-[#25364d]">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-[#8592a6] truncate mt-0.5" title={item.url}>
                        {item.url}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions (Copy + Open + Delete) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.url)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300' 
                          : 'bg-[#151a24] border-[#222a3a] text-neutral-300 hover:text-white hover:bg-[#1c2433]'
                      }`}
                      title="Copy URL to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Open in new tab"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {item.isDeletable && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b222f] bg-[#0c1017] flex items-center justify-between text-xs">
          <span className="text-[#64748b]">
            Links are immediately saved to this issue record.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
