import React, { useState } from 'react';
import { Store, Plus, Search, ExternalLink, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { StoreAccount, TeamType } from '../../types';

export const StoreMatrixView: React.FC = () => {
  const { stores, addStore } = usePortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    platform: 'Fiverr' as StoreAccount['platform'],
    assignedTeam: 'Shopi_Day' as TeamType,
    lead: 'Md Samiul Ajom',
    activeOrders: 5,
    health: 'Excellent' as StoreAccount['health'],
    inboxUnread: 0,
    monthlyRevenueTarget: '$5,000'
  });

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assignedTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lead.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addStore(formData);
    setFormData({
      name: '',
      platform: 'Fiverr',
      assignedTeam: 'Shopi_Day',
      lead: 'Md Samiul Ajom',
      activeOrders: 5,
      health: 'Excellent',
      inboxUnread: 0,
      monthlyRevenueTarget: '$5,000'
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agency Store & Profile Matrix</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Active Fiverr stores, shift coverage, unread inbox monitors, and revenue pacing.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Profile</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#64748b]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search store name, team, or manager..."
          className="w-full pl-10 pr-4 py-2 bg-[#0c0f14] border border-[#1c222d] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-[#64748b]"
        />
      </div>

      {/* Grid of Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map(store => (
          <div
            key={store.id}
            className="p-5 rounded-xl bg-[#0b0e14] border border-[#1a212c] hover:border-[#283244] transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#161d28] border border-[#232d3d] flex items-center justify-center text-amber-400">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{store.name}</h3>
                  <span className="text-[11px] text-[#64748b]">{store.platform}</span>
                </div>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  store.health === 'Excellent'
                    ? 'bg-emerald-950 text-emerald-300'
                    : store.health === 'Good'
                    ? 'bg-blue-950 text-blue-300'
                    : 'bg-red-950 text-red-300'
                }`}
              >
                {store.health}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-[#121620] border border-[#1d2433]">
              <div>
                <span className="text-[#64748b] block text-[11px]">Active Orders</span>
                <span className="text-white font-bold font-mono text-base">{store.activeOrders}</span>
              </div>
              <div>
                <span className="text-[#64748b] block text-[11px]">Unread Inboxes</span>
                <span className={`font-bold font-mono text-base ${store.inboxUnread > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                  {store.inboxUnread}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-[#1d2433]">
                <span className="text-[#64748b] text-[11px]">Lead: </span>
                <span className="text-neutral-200 font-medium">{store.lead}</span>
                <span className="text-[#64748b] text-[11px] ml-2">Team: </span>
                <span className="text-amber-300 font-mono text-[11px]">{store.assignedTeam}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-[#64748b]">
              <span>Target: <strong className="text-white font-mono">{store.monthlyRevenueTarget || 'N/A'}</strong></span>
              <a
                href={`https://fiverr.com/${store.name.replace('_Fiverr', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Store Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <h3 className="text-base font-bold text-white">Add Store / Account Profile</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#94a3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Store Username / Handle *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. shopify_pro_Fiverr"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Fiverr">Fiverr</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Shopify Partner">Shopify Partner</option>
                    <option value="Direct Client">Direct Client</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Assigned Team</label>
                  <select
                    value={formData.assignedTeam}
                    onChange={e => setFormData({ ...formData, assignedTeam: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  >
                    <option value="Shopi_Day">Shopi_Day</option>
                    <option value="Shopi_Night">Shopi_Night</option>
                    <option value="Wix_Day">Wix_Day</option>
                    <option value="CMS_Day">CMS_Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Lead Developer</label>
                  <input
                    type="text"
                    value={formData.lead}
                    onChange={e => setFormData({ ...formData, lead: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Monthly Target</label>
                  <input
                    type="text"
                    placeholder="$5,000"
                    value={formData.monthlyRevenueTarget}
                    onChange={e => setFormData({ ...formData, monthlyRevenueTarget: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-lg text-white"
                  />
                </div>
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
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
