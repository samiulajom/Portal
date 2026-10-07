import React, { useState, useEffect } from 'react';
import { Search, X, Layers, AlertCircle, FileText, Users, Store, ArrowRight } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab,
    issues,
    queues,
    updates,
    stations,
    stores
  } = usePortal();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  // Search matches
  const matchedIssues = q ? issues.filter(i => i.clientName.toLowerCase().includes(q) || i.profile.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchedQueues = q ? queues.filter(k => k.clientName.toLowerCase().includes(q) || k.queueKey.toLowerCase().includes(q) || k.title.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchedUpdates = q ? updates.filter(u => u.clientName.toLowerCase().includes(q) || u.message.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchedStores = q ? stores.filter(s => s.name.toLowerCase().includes(q)).slice(0, 2) : [];

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-20 p-4 backdrop-blur-xs">
      <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-scaleIn">
        {/* Search Input */}
        <div className="relative border-b border-[#202937] p-3 flex items-center">
          <Search className="w-4 h-4 text-[#64748b] ml-2 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tickets, clients, stations, or press Tab to browse..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-[#64748b]"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-[#64748b] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {query.trim() === '' ? (
            <div>
              <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider block mb-2 px-2">
                Quick Navigation
              </span>
              <div className="space-y-1">
                {[
                  { label: 'Overview Dashboard', tab: 'overview', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
                  { label: 'Issue Sheet', tab: 'issues', icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" /> },
                  { label: 'Update Sheet (Entries)', tab: 'updates', icon: <FileText className="w-3.5 h-3.5 text-blue-400" /> },
                  { label: 'Station Roster', tab: 'stations', icon: <Users className="w-3.5 h-3.5 text-emerald-400" /> },
                  { label: 'Queue Requests', tab: 'queue', icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
                  { label: 'Store Matrix Accounts', tab: 'stores', icon: <Store className="w-3.5 h-3.5 text-cyan-400" /> }
                ].map(item => (
                  <button
                    key={item.tab}
                    onClick={() => handleSelectTab(item.tab)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#161c26] text-neutral-300 hover:text-white text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#64748b]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Queues matched */}
              {matchedQueues.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1.5 px-2">
                    Queue Tickets
                  </span>
                  {matchedQueues.map(qItem => (
                    <button
                      key={qItem.id}
                      onClick={() => handleSelectTab('queue')}
                      className="w-full p-2 rounded-lg hover:bg-[#161c26] text-left flex items-center justify-between text-neutral-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300">{qItem.queueKey}</span>
                        <span>{qItem.clientName}</span>
                        <span className="text-[#64748b]">({qItem.title})</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                        {qItem.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Issues matched */}
              {matchedIssues.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider block mb-1.5 px-2">
                    Issues
                  </span>
                  {matchedIssues.map(i => (
                    <button
                      key={i.id}
                      onClick={() => handleSelectTab('issues')}
                      className="w-full p-2 rounded-lg hover:bg-[#161c26] text-left flex items-center justify-between text-neutral-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{i.clientName}</span>
                        <span className="text-[#64748b] font-mono">{i.profile}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{i.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Stores matched */}
              {matchedStores.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1.5 px-2">
                    Stores
                  </span>
                  {matchedStores.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectTab('stores')}
                      className="w-full p-2 rounded-lg hover:bg-[#161c26] text-left flex items-center justify-between text-neutral-300 hover:text-white"
                    >
                      <span className="font-mono text-white">{s.name}</span>
                      <span className="text-[#64748b]">{s.assignedTeam}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedQueues.length === 0 && matchedIssues.length === 0 && matchedStores.length === 0 && (
                <div className="py-6 text-center text-[#64748b]">
                  No records found matching "{query}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-[#0b0e14] border-t border-[#202937] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#161c26] text-neutral-300 border border-[#273244]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
