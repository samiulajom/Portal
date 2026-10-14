import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  RotateCw, 
  Trash2, 
  Search, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  X, 
  MessageSquare,
  ShoppingBag,
  Link2,
  Send,
  History,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Upload,
  Maximize2,
  Eye,
  Paperclip,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { QueueItem, QueueStatus, QueueUpdate } from '../../types';

interface LinkItem {
  id?: string;
  label: string;
  url: string;
}

// Sample fallback screenshot DataURL for instant demo / image.png option
const SAMPLE_IMAGE_PNG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" rx="8" fill="%230f172a"/><rect x="20" y="20" width="560" height="40" rx="6" fill="%231e293b"/><circle cx="45" cy="40" r="6" fill="%23ef4444"/><circle cx="65" cy="40" r="6" fill="%23f59e0b"/><circle cx="85" cy="40" r="6" fill="%2310b981"/><text x="110" y="44" fill="%2394a3b8" font-family="sans-serif" font-size="12">Fiverr Inbox Screenshot - Client Bug Report</text><rect x="20" y="75" width="560" height="245" rx="6" fill="%23111827"/><text x="40" y="115" fill="%23f8fafc" font-family="sans-serif" font-weight="bold" font-size="14">Client: alexander_ecom</text><text x="40" y="145" fill="%23cbd5e1" font-family="sans-serif" font-size="12">"Hi team, the product bundle button on checkout gives a 404 error when clicking discount code."</text><rect x="40" y="170" width="230" height="30" rx="4" fill="%23dc2626" fill-opacity="0.2"/><text x="50" y="190" fill="%23f87171" font-family="sans-serif" font-size="11">Error: Invalid Discount Endpoint (404)</text><text x="40" y="240" fill="%2394a3b8" font-family="sans-serif" font-size="11">Operation Request: Need sales person to check active order status &amp; send inbox URL.</text></svg>';

export const QueueView: React.FC = () => {
  const { 
    queues, 
    addQueue, 
    addQueueUpdate, 
    deleteQueueUpdate, 
    deleteQueue, 
    deleteAllQueues, 
    user,
    savedMembers,
    hasPermission 
  } = usePortal();

  const canCreateQueue = hasPermission('create_queue');
  const canProcessQueue = hasPermission('process_queue');
  const canDeleteQueue = hasPermission('delete_queue') || hasPermission('delete_records');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  // Notification toast for completed / deleted queue
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Copy state feedback ("client name, order name copy korte parbe")
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label}: "${text}"`, 'success');
    setTimeout(() => {
      setCopiedField(prev => (prev === label ? null : prev));
    }, 2000);
  };

  // Lightbox / Image Preview Modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Active queue for the Updates Modal
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

  // Update Form State (inside update modal for Sales Person)
  const [updateFormData, setUpdateFormData] = useState({
    salesPerson: '',
    comment: '',
    inboxUrl: '',
    orderPageUrl: '',
    imageUrl: '',
    imageName: '',
    otherLinks: [] as LinkItem[]
  });

  // Success flash message in update modal
  const [updateSuccessToast, setUpdateSuccessToast] = useState(false);

  // Checkbox for optional attachment in Create Queue Modal (hidden by default)
  const [includeAttachment, setIncludeAttachment] = useState(false);

  // Create Form State (Operation Specialist Requesting from Sales)
  const [formData, setFormData] = useState({
    clientName: '',
    orderId: '',
    profileStore: 'ecom_store3_fiverr',
    title: '',
    salesPerson: 'Shishir chowdhory',
    submittedBy: user.name || 'Operation Specialist',
    department: 'Operation',
    priority: 'Normal' as 'Normal' | 'Urgent',
    notes: '',
    imageUrl: '',
    imageName: '',
    conversationUrl: '',
    orderPageUrl: '',
    otherLinks: [] as LinkItem[]
  });

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  // Find active queue object
  const activeQueue = useMemo(() => {
    return queues.find(q => q.id === activeQueueId) || null;
  }, [queues, activeQueueId]);

  // Open the update modal and initialize form values
  const handleOpenUpdateModal = (queue: QueueItem) => {
    setActiveQueueId(queue.id);
    setUpdateFormData({
      salesPerson: queue.salesPerson || user.name || '',
      comment: '',
      inboxUrl: queue.conversationUrl || '',
      orderPageUrl: queue.orderPageUrl || '',
      imageUrl: '',
      imageName: '',
      otherLinks: []
    });
  };

  const handleCloseUpdateModal = () => {
    setActiveQueueId(null);
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete queue handler ("kaj kore delete kore dibe, quew ta, tahole complete ai status er e dorkar nei")
  const handleDeleteQueue = (id: string, queueKey: string) => {
    deleteQueue(id);
    showToast(`Queue #${queueKey} deleted!`, 'info');
  };

  // Convert File to Base64 Data URL
  const processImageFile = (file: File, onSuccess: (dataUrl: string, fileName: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string, file.name || 'image.png');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for Create Queue form
  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl, fileName) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: dataUrl,
          imageName: fileName
        }));
      });
    }
  };

  // Handle image paste on Create Modal window
  const handleCreatePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setIncludeAttachment(true);
            processImageFile(file, (dataUrl, fileName) => {
              setFormData(prev => ({
                ...prev,
                imageUrl: dataUrl,
                imageName: fileName || 'image.png'
              }));
            });
            break;
          }
        }
      }
    }
  };

  // Handle image upload for Update Modal form
  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl, fileName) => {
        setUpdateFormData(prev => ({
          ...prev,
          imageUrl: dataUrl,
          imageName: fileName
        }));
      });
    }
  };

  // Add / remove link in update modal
  const handleAddUpdateOtherLink = () => {
    setUpdateFormData(prev => ({
      ...prev,
      otherLinks: [...prev.otherLinks, { id: `lnk-${Date.now()}`, label: '', url: '' }]
    }));
  };

  const handleRemoveUpdateOtherLink = (index: number) => {
    setUpdateFormData(prev => ({
      ...prev,
      otherLinks: prev.otherLinks.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateOtherLinkField = (index: number, field: 'label' | 'url', value: string) => {
    setUpdateFormData(prev => {
      const next = [...prev.otherLinks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, otherLinks: next };
    });
  };

  // Auto fill inbox link in update modal
  const handleAutofillUpdateInbox = () => {
    if (activeQueue) {
      setUpdateFormData(prev => ({
        ...prev,
        inboxUrl: `https://fiverr.com/inbox/${activeQueue.clientName}`
      }));
    }
  };

  // Submit a new sales update (automatically marks queue status as 'Given'!)
  const handleSubmitSalesUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQueue) return;

    if (
      !updateFormData.comment.trim() && 
      !updateFormData.inboxUrl.trim() && 
      !updateFormData.orderPageUrl.trim() && 
      updateFormData.otherLinks.length === 0 &&
      !updateFormData.imageUrl
    ) {
      return;
    }

    // "update dise mane provide korese" -> automatically sets status to 'Given'!
    addQueueUpdate(activeQueue.id, {
      salesPerson: updateFormData.salesPerson.trim() || activeQueue.salesPerson || user.name,
      comment: updateFormData.comment.trim() || 'Sales person provided update.',
      inboxUrl: updateFormData.inboxUrl.trim() || undefined,
      orderPageUrl: updateFormData.orderPageUrl.trim() || undefined,
      imageUrl: updateFormData.imageUrl || undefined,
      imageName: updateFormData.imageName || undefined,
      otherLinks: updateFormData.otherLinks
        .filter(l => l.url && l.url.trim())
        .map(l => ({
          label: l.label.trim() || 'Resource Link',
          url: l.url.trim()
        })),
      statusChange: 'Given' // Automatic status update!
    });

    const savedKey = activeQueue.queueKey;

    // Reset fields except salesPerson
    setUpdateFormData(prev => ({
      ...prev,
      comment: '',
      imageUrl: '',
      imageName: '',
      otherLinks: []
    }));

    // Auto-close modal as requested ("post sales update korle popup ta clode hoye jabem, mane give hoiye jabe")
    handleCloseUpdateModal();

    setUpdateSuccessToast(true);
    setTimeout(() => setUpdateSuccessToast(false), 2500);
    showToast(`Update posted! Queue #${savedKey} marked as Given.`, 'success');
  };

  // Submit new Queue Request by Operation ("ami add korsi mane request koresi" -> auto Requested)
  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim()) return;

    // Build clean title from operation note or client name & order ID
    const generatedTitle = formData.notes.trim()
      ? formData.notes.trim().split('\n')[0].slice(0, 80)
      : `Update requested for ${formData.clientName.trim()}${formData.orderId.trim() ? ` · #${formData.orderId.trim()}` : ''}`;

    // "add korsi mane request koresi" -> status is automatically 'Requested'!
    addQueue({
      status: 'Requested',
      priority: formData.priority || 'Normal',
      department: 'Operation',
      orderId: formData.orderId.trim() || undefined,
      clientName: formData.clientName.trim(),
      profileStore: formData.profileStore.trim() || 'ecom_store3_fiverr',
      title: generatedTitle,
      submittedBy: formData.submittedBy.trim() || user.name || 'Operation Specialist',
      salesPerson: formData.salesPerson.trim() || 'Shishir chowdhory',
      notes: formData.notes.trim() || undefined,
      imageUrl: includeAttachment ? (formData.imageUrl || undefined) : undefined,
      imageName: includeAttachment ? (formData.imageName || (formData.imageUrl ? 'image.png' : undefined)) : undefined,
      updates: []
    });

    showToast('New queue request created (Requested)', 'info');

    // Reset form
    setFormData({
      clientName: '',
      orderId: '',
      profileStore: 'ecom_store3_fiverr',
      title: '',
      salesPerson: 'Shishir chowdhory',
      submittedBy: user.name || 'Operation Specialist',
      department: 'Operation',
      priority: 'Normal',
      notes: '',
      imageUrl: '',
      imageName: '',
      conversationUrl: '',
      orderPageUrl: '',
      otherLinks: []
    });
    setIncludeAttachment(false);
    setIsCreateModalOpen(false);
  };

  // Metrics counters
  const totalCount = queues.length;
  const requestedCount = queues.filter(q => q.status === 'Requested').length;
  const givenCount = queues.filter(q => q.status === 'Given').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtered queues
  const filteredQueues = useMemo(() => {
    return queues.filter(q => {
      const matchesStatus = statusFilter === 'All Status' || q.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        q.clientName.toLowerCase().includes(term) ||
        (q.orderId && q.orderId.toLowerCase().includes(term)) ||
        q.profileStore.toLowerCase().includes(term) ||
        q.queueKey.toLowerCase().includes(term) ||
        q.title.toLowerCase().includes(term) ||
        q.salesPerson.toLowerCase().includes(term) ||
        (q.submittedBy && q.submittedBy.toLowerCase().includes(term)) ||
        (q.notes && q.notes.toLowerCase().includes(term)) ||
        (q.updates && q.updates.some(u => u.comment.toLowerCase().includes(term) || u.salesPerson.toLowerCase().includes(term)))
      );
    });
  }, [queues, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141924] border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-slideIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Queue</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Automated Workflow</span>
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            <strong>Add</strong> = Requested · <strong>Sales Update</strong> = Given · <strong>Done</strong> = Delete queue
          </p>
        </div>

        {/* Action Buttons: Refresh, + Create Queue Request, Delete All */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-[#11141c] hover:bg-[#181d27] border border-[#1e2531] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            title="Refresh queues"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {canCreateQueue && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Queue Request</span>
            </button>
          )}

          {canDeleteQueue && queues.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="p-2 rounded-lg bg-[#11141c] hover:bg-red-950/40 border border-[#1e2531] hover:border-red-900/50 text-[#94a3b8] hover:text-red-400 transition-colors cursor-pointer"
              title="Delete all queues"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setStatusFilter('All Status')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'All Status' 
              ? 'bg-[#151922] border-amber-500/40 ring-1 ring-amber-500/20' 
              : 'bg-[#0f131a] border-[#1d232f] hover:border-[#2a3445]'
          }`}
        >
          <span className="text-xs text-[#94a3b8] font-medium block">All Active Queues</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('Requested')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Requested' 
              ? 'bg-[#151922] border-amber-500/40 ring-1 ring-amber-500/20' 
              : 'bg-[#0f131a] border-[#1d232f] hover:border-[#2a3445]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">1. Requested</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </div>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{requestedCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('Given')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Given' 
              ? 'bg-[#151922] border-blue-500/40 ring-1 ring-blue-500/20' 
              : 'bg-[#0f131a] border-[#1d232f] hover:border-[#2a3445]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-medium">2. Given</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{givenCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0f131a] p-3 rounded-xl border border-[#1e2531]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search by client, queue ID, title, sales rep, operation note..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141923] border border-[#222b3b] rounded-lg text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#141923] border border-[#222b3b] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="All Status">All Active Queues ({totalCount})</option>
            <option value="Requested">Requested ({requestedCount})</option>
            <option value="Given">Given ({givenCount})</option>
          </select>
        </div>
      </div>

      {/* Queue Cards Grid */}
      {filteredQueues.length === 0 ? (
        <div className="py-16 text-center bg-[#0c1017] rounded-2xl border border-dashed border-[#1e2532] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#161c28] text-[#64748b] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No queue items match your filter</h3>
          <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
            Submit a queue request for your sales person or clear your search filter to view all items.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Queue Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueues.map(item => {
            const hasUpdates = item.updates && item.updates.length > 0;
            const latestUpdate = hasUpdates ? item.updates![0] : null;

            return (
              <div
                key={item.id}
                className="bg-[#0f131a] border border-[#1e2531] hover:border-[#2a3648] rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl relative group"
              >
                <div className="space-y-3">
                  {/* Card Header: Queue ID, Pure Status Badge (NO DROPDOWN), Complete & Delete Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-[#161b24] px-2 py-0.5 rounded-md border border-[#242e3f]">
                        #{item.queueKey}
                      </span>

                      {/* Pure Status Badge (Auto: Requested on add, Given on sales update) */}
                      {item.status === 'Requested' ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Requested</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          <span>Given</span>
                        </span>
                      )}

                      {/* Urgent Priority Badge if any */}
                      {item.priority === 'Urgent' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Urgent</span>
                        </span>
                      )}
                    </div>

                    {/* Action: Delete Queue button */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDeleteQueue(item.id, item.queueKey)}
                        className="text-[#64748b] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors cursor-pointer flex items-center gap-1"
                        title="Delete queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px] font-medium text-neutral-400 hover:text-red-400">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Requester & Sales Rep Meta Row */}
                  <div className="flex items-center justify-between text-[11px] text-[#94a3b8] bg-[#141924]/60 px-2.5 py-1.5 rounded-lg border border-[#1e2634]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#20293a] text-neutral-300 font-medium">Req</span>
                      <span className="text-neutral-200 truncate font-medium">{item.submittedBy || 'Operation'}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-amber-400/90 font-medium">
                      <ArrowRight className="w-3 h-3 text-[#64748b]" />
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{item.salesPerson}</span>
                    </div>
                  </div>

                  {/* Client & Store Pill & Order ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="text-xs font-bold text-white tracking-wide truncate">
                        {item.clientName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyText(item.clientName, `Client Name (${item.clientName})`);
                        }}
                        className="p-1 text-[#64748b] hover:text-white rounded hover:bg-[#1f293d] transition-colors cursor-pointer"
                        title={`Copy client name: ${item.clientName}`}
                      >
                        {copiedField === `Client Name (${item.clientName})` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.orderId && (
                        <div className="flex items-center gap-0.5">
                          <span 
                            className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1"
                            title={`Order ID: ${item.orderId}`}
                          >
                            <ShoppingBag className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{item.orderId}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(item.orderId!, `Order ID (${item.orderId})`);
                            }}
                            className="p-1 text-[#64748b] hover:text-emerald-300 rounded hover:bg-[#1f293d] transition-colors cursor-pointer"
                            title={`Copy Order ID: ${item.orderId}`}
                          >
                            {copiedField === `Order ID (${item.orderId})` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-[#94a3b8] bg-[#151922] px-2 py-0.5 rounded border border-[#212938]">
                        {item.profileStore}
                      </span>
                    </div>
                  </div>

                  {/* Task Title */}
                  <p className="text-xs text-neutral-200 font-semibold leading-snug">
                    {item.title}
                  </p>

                  {/* Operation Notes / Issue Description */}
                  {item.notes && (
                    <div className="bg-[#121620] border border-[#1c2432] rounded-xl p-2.5 text-[11px] text-neutral-300 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 flex items-center gap-1">
                        <span>Operation Note:</span>
                      </div>
                      <p className="leading-relaxed line-clamp-3 text-neutral-300">
                        {item.notes}
                      </p>
                    </div>
                  )}

                  {/* ATTACHED SCREENSHOT / IMAGE.PNG PREVIEW */}
                  {item.imageUrl && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-amber-300 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                          <span>Attached: {item.imageName || 'image.png'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setLightboxImage({ 
                            url: item.imageUrl!, 
                            title: `Screenshot: ${item.imageName || 'image.png'}`,
                            subtitle: `Client: ${item.clientName} · Queue #${item.queueKey}`
                          })}
                          className="text-[10px] text-amber-400 hover:text-amber-200 font-medium flex items-center gap-1 cursor-pointer underline"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>View Full</span>
                        </button>
                      </div>

                      {/* Clickable Image Thumbnail */}
                      <div 
                        onClick={() => setLightboxImage({ 
                          url: item.imageUrl!, 
                          title: `Screenshot: ${item.imageName || 'image.png'}`,
                          subtitle: `Client: ${item.clientName} · Queue #${item.queueKey}`
                        })}
                        className="relative group/img rounded-lg overflow-hidden border border-[#293448] bg-black/40 h-24 flex items-center justify-center cursor-pointer"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.imageName || 'Screenshot attachment'} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 transition-opacity text-white text-[11px] font-semibold backdrop-blur-[1px]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Click to Inspect</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SALES UPDATES & LINKS SECTION */}
                  <div className="pt-2 border-t border-[#1c2432] space-y-2">
                    {/* Header: Sales Updates (Count) + Give Update Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Sales Updates
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1b2230] text-[#94a3b8] font-mono">
                          {item.updates?.length || 0}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenUpdateModal(item)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Update</span>
                      </button>
                    </div>

                    {/* Direct Quick Action Buttons from Sales (Inbox & Order Links) */}
                    {(item.conversationUrl || item.orderPageUrl) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.conversationUrl && (
                          <a
                            href={item.conversationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 text-[11px] text-blue-300 hover:text-white transition-colors font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Inbox Link</span>
                          </a>
                        )}

                        {item.orderPageUrl && (
                          <a
                            href={item.orderPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-[11px] text-emerald-300 hover:text-white transition-colors font-medium"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Order Page</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Latest Update Box or Awaiting State */}
                    {!latestUpdate ? (
                      <div className="p-3 rounded-xl bg-[#121622] border border-dashed border-[#202838] text-center space-y-1.5">
                        <p className="text-[11px] text-amber-400/90 font-medium flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting update from {item.salesPerson}</span>
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          Sales will supply Inbox URL, Order URL, notes &amp; links.
                        </p>
                        <button
                          onClick={() => handleOpenUpdateModal(item)}
                          className="mt-1 text-[11px] px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>+ Provide Update Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[#131824] border border-[#232d3f] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                          <span className="font-semibold text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            <span>{latestUpdate.salesPerson}</span>
                          </span>
                          <span>{latestUpdate.createdAt}</span>
                        </div>

                        <p className="text-[11px] text-neutral-200 line-clamp-2 leading-relaxed">
                          {latestUpdate.comment}
                        </p>

                        {/* Extra Links attached in latest update */}
                        {latestUpdate.otherLinks && latestUpdate.otherLinks.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {latestUpdate.otherLinks.map((lnk, lidx) => (
                              <a
                                key={lidx}
                                href={lnk.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40 hover:text-white flex items-center gap-1"
                              >
                                <Link2 className="w-2.5 h-2.5" />
                                <span>{lnk.label || 'Link'}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <button
                            onClick={() => handleOpenUpdateModal(item)}
                            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span>View All Updates ({item.updates?.length})</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Timestamp & Actions */}
                <div className="pt-3 mt-3 border-t border-[#18202d] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Created {item.createdAt}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {canDeleteQueue && (
                      <>
                        <button
                          onClick={() => handleDeleteQueue(item.id, item.queueKey)}
                          className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Delete queue"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                        <span className="text-[#334155]">·</span>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenUpdateModal(item)}
                      className="text-white hover:text-amber-400 font-medium transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <span>{canProcessQueue ? 'Manage / Updates' : 'View Updates'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CREATE QUEUE REQUEST MODAL (Operation Specialist → Sales)               */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div 
          onPaste={handleCreatePaste}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto"
        >
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-xl my-6 p-6 space-y-4 shadow-2xl animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#202937] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Operation Request
                  </span>
                  <span className="text-xs text-[#94a3b8]">→ Assigned Sales Rep</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Submit New Queue Request</h3>
                <p className="text-xs text-[#94a3b8]">
                  Request an update from sales. Automatically created as <strong className="text-amber-400">Requested</strong>.
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQueue} className="space-y-4 text-xs">
              {/* Client Username, Order ID, and Profile Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Client Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. christinaslo"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Order ID</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #FO38920194"
                    value={formData.orderId}
                    onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Profile Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ecom_store3_fiverr"
                    value={formData.profileStore}
                    onChange={e => setFormData({ ...formData, profileStore: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Assign Sales Representative & Priority (Default: Normal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Assign Sales Representative *</label>
                  <input
                    type="text"
                    required
                    list="sales-members-list"
                    placeholder="Select or type sales person"
                    value={formData.salesPerson}
                    onChange={e => setFormData({ ...formData, salesPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="sales-members-list">
                    {savedMembers.map(m => (
                      <option key={m.id} value={m.name} />
                    ))}
                    <option value="Shishir chowdhory" />
                    <option value="Kawsar ahamed" />
                    <option value="Farhana afroz" />
                  </datalist>
                </div>

                <div>
                  <label className="text-[#94a3b8] block mb-1 font-medium">Priority (Default: Normal)</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as 'Normal' | 'Urgent' })}
                    className="w-full px-3 py-2 bg-[#161b24] border border-[#273244] rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">🔥 Urgent</option>
                  </select>
                </div>
              </div>

              {/* Operation Note */}
              <div>
                <label className="text-[#94a3b8] block mb-1 font-medium">Operation Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail what happened, what client reported, or what update sales needs to provide..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#161b24] border border-[#273244] rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Attachment Checkbox (Hidden by default, opens if checkmark is turned on) */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141924] border border-[#232b3c] hover:border-amber-500/40 cursor-pointer transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={includeAttachment}
                    onChange={e => {
                      setIncludeAttachment(e.target.checked);
                      if (!e.target.checked) {
                        setFormData(prev => ({ ...prev, imageUrl: '', imageName: '' }));
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#0e121a] border-[#2f3b50] cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Attach Screenshot / Image (Optional)</span>
                  </div>
                  <span className="text-[10px] text-[#94a3b8] ml-auto">
                    {includeAttachment ? '✓ Open' : 'Check to open attachment'}
                  </span>
                </label>

                {/* Opens only if checkmark is turned ON */}
                {includeAttachment && (
                  <div className="mt-2.5 p-3.5 rounded-xl border border-amber-500/30 bg-[#141923] space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold flex items-center gap-1.5 text-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Screenshot / Image Attachment (<code className="text-amber-300 font-mono text-[11px]">image.png</code>)</span>
                      </span>
                      <span className="text-[10px] text-[#94a3b8]">Paste (Ctrl+V) or browse</span>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={createFileInputRef}
                      accept="image/*"
                      onChange={handleCreateImageChange}
                      className="hidden"
                    />

                    {formData.imageUrl ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e1219] border border-[#273347]">
                        <div 
                          onClick={() => setLightboxImage({ url: formData.imageUrl, title: formData.imageName || 'image.png' })}
                          className="w-16 h-12 rounded bg-black/50 overflow-hidden border border-[#3b475d] shrink-0 cursor-pointer relative group/thumb"
                        >
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs truncate">
                              {formData.imageName || 'image.png'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              Attached
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94a3b8] mt-0.5">Ready to submit with queue request</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLightboxImage({ url: formData.imageUrl, title: formData.imageName || 'image.png' })}
                            className="px-2 py-1 rounded bg-[#1e2736] hover:bg-[#283448] text-white text-[11px] cursor-pointer"
                            title="View screenshot"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageName: '' }))}
                            className="p-1 text-[#94a3b8] hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => createFileInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-lg bg-[#1a2130] hover:bg-[#222c40] border border-[#2a364d] text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Browse image.png / File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              imageUrl: SAMPLE_IMAGE_PNG,
                              imageName: 'image.png'
                            }));
                          }}
                          className="py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Attach Demo image.png</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#202937]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181d26] text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Queue Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SALES PERSON UPDATE MODAL (Sales Person provides update)               */}
      {/* ========================================================================= */}
      {activeQueue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-[#0f131a] border border-[#222a38] rounded-2xl w-full max-w-2xl my-6 shadow-2xl animate-scaleIn flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#202937] flex items-center justify-between bg-[#111622]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    #{activeQueue.queueKey}
                  </span>
                  <span className="text-xs font-bold text-white">
                    Sales Person Update
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    activeQueue.status === 'Requested'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {activeQueue.status === 'Requested' ? 'Requested' : 'Given'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-[#94a3b8] pt-0.5">
                  <span className="inline-flex items-center gap-1.5 bg-[#161d2b] px-2 py-0.5 rounded border border-[#253043]">
                    <span className="text-[#64748b]">Client:</span>
                    <strong className="text-white font-semibold">{activeQueue.clientName}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeQueue.clientName, 'Client Name')}
                      className="text-[#94a3b8] hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copy Client Name"
                    >
                      {copiedField === 'Client Name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>

                  {activeQueue.orderId && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      <span className="text-emerald-500/80 font-mono">Order ID:</span>
                      <strong className="text-emerald-400 font-mono font-semibold">{activeQueue.orderId}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyText(activeQueue.orderId!, 'Order ID')}
                        className="text-emerald-400 hover:text-emerald-200 p-0.5 rounded hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedField === 'Order ID' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                  )}

                  <span className="text-[#94a3b8] font-mono text-[11px]">
                    ({activeQueue.profileStore})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteQueue(activeQueue.id, activeQueue.queueKey);
                    handleCloseUpdateModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Delete queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Queue</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="text-[#94a3b8] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* QUICK COPY BAR FOR SALES REP ("client name, order name copy korte parbe") */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#131926] border border-[#232f48] shadow-inner space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Copy Details for Marketplace / Inbox:</span>
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Click any box to copy to clipboard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {/* 1. Client Name Copy */}
                  <button
                    type="button"
                    onClick={() => handleCopyText(activeQueue.clientName, 'Client Name')}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0c1018] hover:bg-[#162133] border border-[#1f293b] hover:border-blue-500/50 text-left transition-all cursor-pointer group"
                    title={`Copy client username: ${activeQueue.clientName}`}
                  >
                    <div className="truncate mr-2">
                      <span className="text-[9px] uppercase font-bold text-[#64748b] tracking-wider block">Client Name</span>
                      <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate block">
                        {activeQueue.clientName}
                      </span>
                    </div>
                    <span className="p-1 rounded bg-[#162133] group-hover:bg-blue-500/20 text-[#94a3b8] group-hover:text-blue-300 shrink-0 transition-colors">
                      {copiedField === 'Client Name' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>

                  {/* 2. Order ID Copy (if available) */}
                  {activeQueue.orderId ? (
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeQueue.orderId!, 'Order ID')}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#0c1018] hover:bg-[#162133] border border-[#1f293b] hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                      title={`Copy Order ID: ${activeQueue.orderId}`}
                    >
                      <div className="truncate mr-2">
                        <span className="text-[9px] uppercase font-bold text-emerald-500/80 tracking-wider block">Order ID</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300 truncate block">
                          {activeQueue.orderId}
                        </span>
                      </div>
                      <span className="p-1 rounded bg-[#162133] group-hover:bg-emerald-500/20 text-[#94a3b8] group-hover:text-emerald-300 shrink-0 transition-colors">
                        {copiedField === 'Order ID' ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  ) : null}

                  {/* 3. Order Name / Task Title Copy */}
                  <button
                    type="button"
                    onClick={() => handleCopyText(activeQueue.title, 'Order Name')}
                    className={`flex items-center justify-between p-2.5 rounded-lg bg-[#0c1018] hover:bg-[#162133] border border-[#1f293b] hover:border-amber-500/50 text-left transition-all cursor-pointer group ${!activeQueue.orderId ? 'sm:col-span-2 md:col-span-2' : ''}`}
                    title={`Copy Order Name / Title: ${activeQueue.title}`}
                  >
                    <div className="truncate mr-2">
                      <span className="text-[9px] uppercase font-bold text-amber-500/80 tracking-wider block">Order Name / Title</span>
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 truncate block">
                        {activeQueue.title}
                      </span>
                    </div>
                    <span className="p-1 rounded bg-[#162133] group-hover:bg-amber-500/20 text-[#94a3b8] group-hover:text-amber-300 shrink-0 transition-colors">
                      {copiedField === 'Order Name' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* OPERATION REQUEST CONTEXT CARD */}
              <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1e2637] space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Requested by: <strong className="text-white">{activeQueue.submittedBy || 'Operation'}</strong> ({activeQueue.createdAt})</span>
                  </span>
                  {activeQueue.priority === 'Urgent' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                      🔥 Urgent
                    </span>
                  )}
                </div>

                {activeQueue.notes && (
                  <p className="text-xs text-neutral-300 leading-relaxed bg-[#0c1017] p-2.5 rounded-lg border border-[#1b2230]">
                    {activeQueue.notes}
                  </p>
                )}

                {/* If Operation attached a screenshot (image.png), display thumbnail for Sales Rep! */}
                {activeQueue.imageUrl && (
                  <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <div 
                        onClick={() => setLightboxImage({ 
                          url: activeQueue.imageUrl!, 
                          title: `Screenshot: ${activeQueue.imageName || 'image.png'}`,
                          subtitle: `Attached by ${activeQueue.submittedBy} for ${activeQueue.clientName}`
                        })}
                        className="w-14 h-10 rounded bg-black/60 overflow-hidden border border-[#3b475d] shrink-0 cursor-pointer relative group/op"
                      >
                        <img 
                          src={activeQueue.imageUrl} 
                          alt="Screenshot" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/op:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {activeQueue.imageName || 'image.png'}
                        </span>
                        <span className="text-[10px] text-amber-300">
                          Operation screenshot attached
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLightboxImage({ 
                        url: activeQueue.imageUrl!, 
                        title: `Screenshot: ${activeQueue.imageName || 'image.png'}`,
                        subtitle: `Attached by ${activeQueue.submittedBy} for ${activeQueue.clientName}`
                      })}
                      className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SALES PERSON INPUT FORM (No status dropdown needed - auto 'Given'!) */}
              <div className="p-4 rounded-xl bg-[#141924] border border-[#242e40] space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#212a3b] pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Provide Sales Update (Inbox, Order, Notes, Links)</span>
                  </h4>
                  {updateSuccessToast && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold animate-fadeIn">
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Posted!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmitSalesUpdate} className="space-y-3 text-xs">
                  {/* Sales Rep Name */}
                  <div>
                    <label className="text-[#94a3b8] block mb-1 font-medium">Sales Person Name *</label>
                    <input
                      type="text"
                      required
                      list="sales-person-select-list"
                      placeholder="Sales Rep Name"
                      value={updateFormData.salesPerson}
                      onChange={e => setUpdateFormData({ ...updateFormData, salesPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-[#10141d] border border-[#232c3d] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                    <datalist id="sales-person-select-list">
                      {savedMembers.map(m => (
                        <option key={m.id} value={m.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Conversation / Inbox URL & Order Page URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[#94a3b8] font-medium">Client Inbox URL</label>
                        <button
                          type="button"
                          onClick={handleAutofillUpdateInbox}
                          className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          Auto Fiverr Inbox
                        </button>
                      </div>
                      <input
                        type="url"
                        placeholder="https://fiverr.com/inbox/..."
                        value={updateFormData.inboxUrl}
                        onChange={e => setUpdateFormData({ ...updateFormData, inboxUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#10141d] border border-[#232c3d] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[#94a3b8] font-medium">Order Page URL</label>
                        {activeQueue.orderId && (
                          <button
                            type="button"
                            onClick={() => {
                              const cleanId = activeQueue.orderId?.replace(/^[#\s]+/, '');
                              setUpdateFormData(prev => ({
                                ...prev,
                                orderPageUrl: `https://fiverr.com/orders/${cleanId}`
                              }));
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                          >
                            Auto Fiverr Order
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://fiverr.com/orders/FO..."
                        value={updateFormData.orderPageUrl}
                        onChange={e => setUpdateFormData({ ...updateFormData, orderPageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#10141d] border border-[#232c3d] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Comment / Response */}
                  <div>
                    <label className="text-[#94a3b8] block mb-1 font-medium">Sales Note / Response to Operation</label>
                    <textarea
                      rows={2}
                      placeholder="Write response for operation (e.g. Spoke to client, discount coupon applied, delivery scheduled)..."
                      value={updateFormData.comment}
                      onChange={e => setUpdateFormData({ ...updateFormData, comment: e.target.value })}
                      className="w-full px-3 py-2 bg-[#10141d] border border-[#232c3d] rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Optional Sales Proof / Screenshot */}
                  <div>
                    <input
                      type="file"
                      ref={updateFileInputRef}
                      accept="image/*"
                      onChange={handleUpdateImageChange}
                      className="hidden"
                    />
                    {updateFormData.imageUrl ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#10141d] border border-[#232c3d]">
                        <span className="text-white text-xs truncate flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>{updateFormData.imageName || 'image.png'} attached</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setUpdateFormData(prev => ({ ...prev, imageUrl: '', imageName: '' }))}
                          className="text-[#94a3b8] hover:text-red-400 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateFileInputRef.current?.click()}
                        className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Paperclip className="w-3 h-3 text-amber-400" />
                        <span>Attach sales screenshot / proof (optional)</span>
                      </button>
                    )}
                  </div>

                  {/* Dynamic Other Links for Sales */}
                  <div className="space-y-2 pt-1 border-t border-[#1d2535]">
                    <div className="flex items-center justify-between">
                      <label className="text-[#94a3b8] font-medium flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-violet-400" />
                        <span>Other Resource Links (Drive, Sheet, Loom, Staging)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddUpdateOtherLink}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    {updateFormData.otherLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Google Drive)"
                          value={link.label}
                          onChange={e => handleUpdateOtherLinkField(idx, 'label', e.target.value)}
                          className="w-1/3 px-2.5 py-1.5 bg-[#10141d] border border-[#232c3d] rounded-lg text-white text-xs"
                        />
                        <input
                          type="url"
                          placeholder="URL (https://...)"
                          value={link.url}
                          onChange={e => handleUpdateOtherLinkField(idx, 'url', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-[#10141d] border border-[#232c3d] rounded-lg text-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUpdateOtherLink(idx)}
                          className="p-1.5 text-[#64748b] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#94a3b8]">
                      Posting update automatically sets queue to <strong className="text-blue-400">Given</strong>
                    </span>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Sales Update</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* TIMELINE / HISTORY SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Update History ({activeQueue.updates?.length || 0})</span>
                  </h4>
                </div>

                {!activeQueue.updates || activeQueue.updates.length === 0 ? (
                  <div className="py-6 text-center text-[#64748b] bg-[#121622] rounded-xl border border-dashed border-[#202737] text-xs">
                    No sales updates recorded yet for this queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeQueue.updates.map(u => (
                      <div
                        key={u.id}
                        className="bg-[#121722] border border-[#212b3c] rounded-xl p-3.5 space-y-2.5 transition-colors hover:border-[#2f3d53]"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                              {u.salesPerson.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white">{u.salesPerson}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              Given
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{u.createdAt}</span>
                            </span>
                            <button
                              onClick={() => deleteQueueUpdate(activeQueue.id, u.id)}
                              className="text-[#64748b] hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete update"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-200 leading-relaxed bg-[#0c1017] p-2.5 rounded-lg border border-[#1a2130]">
                          {u.comment}
                        </p>

                        {/* Attached update screenshot if any */}
                        {u.imageUrl && (
                          <div 
                            onClick={() => setLightboxImage({ url: u.imageUrl!, title: u.imageName || 'Proof image' })}
                            className="w-24 h-14 rounded overflow-hidden border border-[#2b3548] cursor-pointer"
                          >
                            <img src={u.imageUrl} alt="Update screenshot" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Clickable Links Row */}
                        {(u.inboxUrl || u.orderPageUrl || (u.otherLinks && u.otherLinks.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {u.inboxUrl && (
                              <a
                                href={u.inboxUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 text-xs text-blue-300 hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open Inbox</span>
                              </a>
                            )}

                            {u.orderPageUrl && (
                              <a
                                href={u.orderPageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-xs text-emerald-300 hover:text-white transition-colors"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Open Order Page</span>
                              </a>
                            )}

                            {u.otherLinks && u.otherLinks.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/50 text-xs text-violet-300 hover:text-white transition-colors"
                              >
                                <Link2 className="w-3 h-3" />
                                <span>{link.label || 'Resource Link'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1f2736] bg-[#111622] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleDeleteQueue(activeQueue.id, activeQueue.queueKey);
                  handleCloseUpdateModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Queue</span>
              </button>

              <button
                type="button"
                onClick={handleCloseUpdateModal}
                className="px-4 py-2 rounded-xl bg-[#1a2130] text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIGHTBOX / FULLSCREEN SCREENSHOT PREVIEW MODAL                         */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-[#0f131a] border border-[#2b3547] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn"
          >
            <div className="p-3.5 border-b border-[#1f2736] flex items-center justify-between bg-[#121622]">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>{lightboxImage.title}</span>
                </h4>
                {lightboxImage.subtitle && (
                  <p className="text-[11px] text-[#94a3b8]">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-white bg-[#1a2130] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-black/60 min-h-[300px]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>

            <div className="p-3 border-t border-[#1f2736] bg-[#121622] flex items-center justify-between text-xs">
              <span className="text-[#94a3b8]">Attached screenshot preview</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE ALL QUEUES CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0f131a] border border-[#273244] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete All Queues?</h3>
                <p className="text-xs text-[#94a3b8]">Clear all submitted queue requests</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#151214] p-3 rounded-xl border border-red-900/30">
              Are you sure you want to permanently delete all <strong className="text-white font-bold">{queues.length}</strong> queue requests?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2533]">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-[#161c28] hover:bg-[#202838] text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAllQueues();
                  setIsDeleteAllModalOpen(false);
                  showToast('All queues cleared.', 'info');
                }}
                className="px-4 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
