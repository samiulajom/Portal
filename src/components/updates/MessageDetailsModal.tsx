import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, CheckCircle2, RotateCcw } from 'lucide-react';
import { UpdateEntry } from '../../types';

interface MessageDetailsModalProps {
  entry: UpdateEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsSent?: (id: string) => void;
  onReopen?: (id: string) => void;
}

export const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({
  entry,
  isOpen,
  onClose,
  onMarkAsSent,
  onReopen
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Format channel name for pill badge
  const displayChannel = entry.updateTo.replace(' Update', '');
  const isCompleted = entry.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#0b0e14] border border-[#202736] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-scaleIn">
        {/* Header matching Screenshot: "Message Details" + X button */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">Message Details</h2>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sent / Completed</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#161c28] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Metadata Grid: 2 rows x 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 pb-5 border-b border-[#1b2230]">
          {/* Row 1, Col 1: PROFILE NAME */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              PROFILE NAME
            </span>
            <span className="font-mono text-xs text-white block">
              {entry.profile}
            </span>
          </div>

          {/* Row 1, Col 2: CLIENT NAME */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              CLIENT NAME
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-white">{entry.clientName}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(entry.clientName, 'clientName')}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Copy client name"
              >
                {copiedField === 'clientName' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Row 1, Col 3: ORDER ID */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              ORDER ID
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-white">{entry.orderId || '—'}</span>
              {entry.orderId && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(entry.orderId!, 'orderId')}
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Copy Order ID"
                >
                  {copiedField === 'orderId' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Row 2, Col 1: UPDATED BY */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              UPDATED BY
            </span>
            <span className="font-mono text-xs text-white block">
              {entry.doneBy || entry.updateBy.replace('@', '')}
            </span>
          </div>

          {/* Row 2, Col 2: TL CHECK */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              TL CHECK
            </span>
            <span className="font-mono text-xs text-white block">
              {entry.tlAt.replace('@', '') || (entry.tlCheck ? 'Verified' : 'Pending')}
            </span>
          </div>

          {/* Row 2, Col 3: MESSAGE SENT TO */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[#8592a6] tracking-wider uppercase block">
              MESSAGE SENT TO
            </span>
            <div className="pt-0.5">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] text-[11px] font-medium shadow-2xs">
                {displayChannel}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Message Header + Copy Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-neutral-300">
            Completion Message
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(entry.message, 'message')}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedField === 'message' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>

        {/* Message Content Area */}
        <div className="text-xs text-neutral-200 leading-relaxed font-normal whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 bg-transparent select-text">
          {entry.message}
        </div>

        {/* Optional Attachments or Comments */}
        {entry.attachments && (
          <div className="p-2.5 rounded-xl bg-[#111622] border border-[#1e2738] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-amber-400 font-semibold">Attachment:</span>
              <span className="font-mono text-neutral-300 truncate text-[11px]">{entry.attachments}</span>
            </div>
            <a
              href={entry.attachments}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] shrink-0 ml-2 font-medium"
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Footer: Status Indicator on Left, Action Buttons on Right */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1b2230]">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Message Sent {entry.sentAt ? `(${entry.sentAt})` : ''} {entry.sentBy ? `by ${entry.sentBy}` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Waiting for sending message...</span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => onReopen && onReopen(entry.id)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Restore to active pending list"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Move to Active</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMarkAsSent && onMarkAsSent(entry.id)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-98"
                title="Mark this message as sent and complete"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Sent (Complete)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#141822] hover:bg-[#1d2331] text-white border border-[#2b3548] transition-colors cursor-pointer active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
