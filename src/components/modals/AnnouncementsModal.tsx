import React from 'react';
import { Megaphone, X, Bell, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const AnnouncementsModal: React.FC = () => {
  const { isAnnouncementsOpen, setIsAnnouncementsOpen, announcements } = usePortal();

  if (!isAnnouncementsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-lg p-6 space-y-5 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202937] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>ScaleUp Bulletins</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v1.0.1
                </span>
              </h3>
              <p className="text-[11px] text-[#94a3b8]">Official agency notices & version release details</p>
            </div>
          </div>

          <button
            onClick={() => setIsAnnouncementsOpen(false)}
            className="p-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#161c26]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Announcements list */}
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {announcements.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border space-y-2 text-xs ${
                item.priority === 'important'
                  ? 'bg-[#18140a] border-amber-500/40'
                  : 'bg-[#121620] border-[#1d2533]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.priority === 'important'
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#1e2533] text-neutral-300'
                }`}>
                  {item.tag}
                </span>
                <span className="text-[11px] font-mono text-[#64748b]">{item.date}</span>
              </div>

              <h4 className="text-sm font-semibold text-white">
                {item.title}
              </h4>

              <p className="text-neutral-300 leading-relaxed">
                {item.content}
              </p>

              <div className="text-[11px] text-[#64748b] pt-1">
                Issued by: <strong className="text-neutral-300 font-normal">{item.author}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#202937] text-xs">
          <span className="text-[#64748b] text-[11px]">Developed By Team FSD</span>
          <button
            onClick={() => setIsAnnouncementsOpen(false)}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
