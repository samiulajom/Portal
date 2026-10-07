import { 
  IssueItem, 
  UpdateEntry, 
  StationGroup, 
  QueueItem, 
  ComplainItem, 
  StoreAccount, 
  HandoverNote,
  AnnouncementItem
} from '../types';

export const initialIssues: IssueItem[] = [
  {
    id: 'iss-1',
    date: '06 Oct, 2026 05:24 AM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'anas_r_naser',
    orderId: 'FO829482910',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: 'Product grid responsive alignment issue on mobile screens',
    orderPageUrl: 'https://fiverr.com/orders/FO829482910',
    inboxPageUrl: 'https://fiverr.com/inbox/anas_r_naser',
    fileMeetingLink: 'https://meet.google.com/xyz-scaleup-dev',
    assignedPerson: 'Monir/Adnan',
    riskLevel: 'Medium',
    salesNote: 'Please follow up on revision request',
    attachmentUrls: [
      { id: 'att-1', label: 'Figma Design', url: 'https://figma.com/file/sample-issue-grid' },
      { id: 'att-2', label: 'Loom Walkthrough', url: 'https://loom.com/share/dev-sample' }
    ],
    status: 'open',
    reportedBy: 'Shishir chowdhory',
    priority: 'high'
  },
  {
    id: 'iss-2',
    date: '05 Oct, 2026 10:18 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'fafo101',
    orderId: 'FO72EC86A2647',
    service: 'CMS',
    team: 'Shopify_Zen',
    specialNotes: 'ex: Scheduled meeting at 12 Sep, 2025 at 9:00 AM',
    orderPageUrl: 'https://drive.google.com/drive/folders/sample-order-link',
    inboxPageUrl: 'https://drive.google.com/file/d/19F0vVAC-M67x7EaUZLgxrhYNN1Y-1HCn',
    fileMeetingLink: 'https://drive.google.com/file/d/sample-meet-file',
    assignedPerson: 'Monir/Adnan',
    riskLevel: 'Low',
    salesNote: 'ex: Please arrange a meeting',
    attachmentUrls: [
      { id: 'att-3', label: 'Drive Asset', url: 'https://drive.google.com/file/d/19F0vVAC-M67x7EaUZLgxrhYNN1Y-1HCn' }
    ],
    status: 'in progress',
    reportedBy: 'Md Samiul Ajom',
    priority: 'medium'
  },
  {
    id: 'iss-3',
    date: '05 Oct, 2026 07:06 AM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'fafo101',
    service: 'WordPress',
    team: 'WP_Titans',
    specialNotes: 'Fixed mega menu dropdown hover lag on iOS Safari',
    inboxPageUrl: 'https://fiverr.com/inbox/fafo101',
    status: 'open',
    reportedBy: 'Md Samiul Ajom',
    priority: 'medium'
  },
  {
    id: 'iss-4',
    date: '04 Oct, 2026 09:51 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'fafo101',
    service: 'Wix',
    team: 'WIX_Spark',
    specialNotes: 'Updated checkout delivery estimated date calculator',
    inboxPageUrl: 'https://fiverr.com/inbox/fafo101',
    status: 'in progress',
    reportedBy: 'Shishir chowdhory',
    priority: 'low'
  },
  {
    id: 'iss-5',
    date: '04 Oct, 2026 07:04 AM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'christinaslo',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: 'Cart flyout drawer price recalculation after quantity change',
    orderPageUrl: 'https://fiverr.com/orders/FO339281190',
    inboxPageUrl: 'https://fiverr.com/inbox/christinaslo',
    fileMeetingLink: 'https://prnt.sc/sample-check-104',
    status: 'open',
    reportedBy: 'Md Samiul Ajom',
    priority: 'high'
  },
  {
    id: 'iss-6',
    date: '03 Oct, 2026 10:13 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'anas_r_naser',
    service: 'Webflow',
    team: 'Webflow',
    specialNotes: 'Metafields namespace conflict in collection schema',
    inboxPageUrl: 'https://fiverr.com/inbox/anas_r_naser',
    status: 'done',
    reportedBy: 'Md Samiul Ajom',
    priority: 'medium',
    resolutionNote: 'Re-synchronized custom collection metafields in JSON template and verified published site.'
  },
  {
    id: 'iss-7',
    date: '03 Oct, 2026 09:51 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'anas_r_naser',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: 'Header badge announcement banner styling',
    inboxPageUrl: 'https://fiverr.com/inbox/anas_r_naser',
    status: 'done',
    reportedBy: 'Shishir chowdhory',
    priority: 'low',
    resolutionNote: 'CSS margin reset applied to sticky top promotion banner.'
  },
  {
    id: 'iss-8',
    date: '03 Oct, 2026 09:50 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'fafo101',
    service: 'Square Space',
    team: 'Square Space',
    specialNotes: 'Hero slider touch gesture sensitivity optimization',
    inboxPageUrl: 'https://fiverr.com/inbox/fafo101',
    status: 'done',
    reportedBy: 'Md Samiul Ajom',
    priority: 'low',
    resolutionNote: 'Reduced swipe threshold from 80px to 35px in flickity slider configuration.'
  },
  {
    id: 'iss-9',
    date: '02 Oct, 2026 10:13 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'fafo101',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: 'Shopify section rendering API pagination issue',
    orderPageUrl: 'https://fiverr.com/orders/FO29482910',
    inboxPageUrl: 'https://fiverr.com/inbox/fafo101',
    fileMeetingLink: 'https://prnt.sc/scaleup-test-run',
    status: 'done',
    reportedBy: 'Md Samiul Ajom',
    priority: 'high',
    resolutionNote: 'Refactored AJAX section query to pass page param cleanly.'
  },
  {
    id: 'iss-10',
    date: '02 Oct, 2026 06:18 AM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'lele_beauty',
    service: 'CMS',
    team: 'Shopi_Day',
    specialNotes: 'Instagram feed widget API token refresh & embed update',
    inboxPageUrl: 'https://fiverr.com/inbox/lele_beauty',
    status: 'done',
    reportedBy: 'Shishir chowdhory',
    priority: 'medium',
    resolutionNote: 'Reconnected Graph API token and re-cached photos.'
  }
];

export const initialUpdates: UpdateEntry[] = [
  {
    id: 'upd-0',
    date: '06 Oct, 2026 02:40 PM',
    profile: 'ecom_store3_Fiverr',
    clientName: 'christinaslo',
    orderId: 'FO2E10297142',
    attachments: '',
    updateBy: '@msifat17088',
    message: 'est',
    commentOperation: '',
    commentSales: '',
    tlCheck: false,
    tlAt: '@Sushmoy',
    updateTo: 'Inbox Page Update',
    doneBy: 'Samiul'
  },
  {
    id: 'upd-1',
    date: '06 Oct, 2026 12:28 PM',
    profile: 'web_mania_Fiverr',
    clientName: 'brandi737',
    updateBy: '@meem',
    message: 'Client requested review of custom swatch color buttons on product page. Updated CSS and sent preview link to inbox.',
    commentOperation: 'Awaiting Client Reply',
    commentSales: 'Client inquired about upsell app integration as add-on package.',
    tlCheck: false,
    tlAt: '@Sakib - CMS',
    updateTo: 'Inbox Page',
    doneBy: 'Meem'
  },
  {
    id: 'upd-2',
    date: '06 Oct, 2026 11:49 AM',
    profile: 'pagetecho_Fiverr',
    clientName: 'dawn_r3s3arch',
    updateBy: '@msifat17088',
    message: 'Replaced blurry banner graphic with high-resolution SVG vector. Tested across iPad, iPhone, and desktop viewports.',
    commentOperation: 'Design Polished',
    commentSales: 'Confirmed with client on order requirement form.',
    tlCheck: true,
    tlAt: '@Sushmoy',
    updateTo: 'Inbox & Order',
    doneBy: 'Sifat'
  },
  {
    id: 'upd-3',
    date: '06 Oct, 2026 11:41 AM',
    profile: 'ppc_buddy_Fiverr',
    clientName: 'mugagadelim',
    updateBy: '@msifat17088',
    message: 'Google Ads campaign negative keyword list synchronized. Conversion tracking tag verified inside GTM container.',
    commentOperation: 'Tag Verified',
    commentSales: 'PPC budget increased by $250/mo.',
    tlCheck: true,
    tlAt: '@Sushmoy',
    updateTo: 'Inbox & Order',
    doneBy: 'Sifat'
  },
  {
    id: 'upd-4',
    date: '06 Oct, 2026 09:31 AM',
    profile: 'pagetecho_Fiverr',
    clientName: 'lorenzo97_',
    updateBy: '@Abir',
    message: 'Speed optimization audit finished. Reduced LCP from 4.8s to 1.7s by deferring 3rd party scripts and lazy loading footer media.',
    commentOperation: '15 Days Ex ...',
    commentSales: 'Requested tip from client upon successful delivery acceptance.',
    tlCheck: true,
    tlAt: '@Sushmoy',
    updateTo: 'Inbox Page',
    doneBy: 'Abir'
  },
  {
    id: 'upd-5',
    date: '05 Oct, 2026 02:20 PM',
    profile: 'sitewix_pro_Fiverr',
    clientName: 'marleamb',
    updateBy: '@Abir',
    message: 'Wix Studio dynamic CMS collection connected for team testimonials. Client feedback applied.',
    commentOperation: 'Delivery A ...',
    commentSales: 'Website er URL attachment e keno thaakbe? - Rifat',
    tlCheck: true,
    tlAt: '@Tuhin',
    updateTo: 'Inbox Page',
    doneBy: 'Abir'
  },
  {
    id: 'upd-6',
    date: '05 Oct, 2026 12:49 PM',
    profile: 'pagetecho_Fiverr',
    clientName: 'lorenzo97_',
    updateBy: '@Abir',
    message: 'Spine Unit page header layout adjusted with custom styling. Sent screenshot verification.',
    commentOperation: 'Reviewed Page',
    commentSales: 'client already Spine Unit page review kore message diche amader ke https://prnt.sc/lvrxSN5ailMo',
    tlCheck: true,
    tlAt: '@Ralive',
    updateTo: 'Inbox Page',
    doneBy: 'Abir'
  },
  {
    id: 'upd-7',
    date: '04 Oct, 2026 08:41 PM',
    profile: 'smmtech_Fiverr',
    clientName: 'likeike',
    orderId: 'FO414FF46F0C2',
    updateBy: 'Sakib Sarder',
    message: `Hey there,

I hope you're doing well and that this message finds you well.

I was thinking about your website today, so I decided to rev-iew it again: https://jkgworldwide.com/

While revie-wing the store, I noticed that there isn't currently a promotional popup. I believe adding a promotional popup with a discount offer, along with an em-ail marketing setup, could help increase your chances of improving sales and conversion rates.

For example, we can offer a discount through the popup and collect visitors' em-ail addresses. Then, using Klaviyo, we can set up automated welcome em-ails and follow-up campaigns for those visitors.

This can also help us re-engage customers who leave the store without completing a purchase, promote new product launches, share special offers, and maintain regular communication with your customers.

If you like this approach, I'd be really happy to set up the complete promotional popup and Klaviyo em-ail marketing system for your store.`,
    commentOperation: 'Delivery Complete',
    commentSales: 'Client accepted delivery with 5-star rating.',
    tlCheck: true,
    tlAt: 'Sakib Sarder',
    updateTo: 'Inbox Page',
    doneBy: 'Sakib Sarder'
  }
];

export const initialStations: StationGroup[] = [
  {
    id: 'st-1',
    name: 'Graphics Design',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:00 AM',
    members: []
  },
  {
    id: 'st-2',
    name: 'Custom station update',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:21 AM',
    members: [
      {
        id: 'mem-1',
        name: 'MD. Rakib Khan',
        initials: 'MR',
        phoneWhatsapp: '+8801712345671',
        role: 'Custom Lead'
      },
      {
        id: 'mem-2',
        name: 'MD ABRAR KARIM RUPU',
        initials: 'MA',
        phoneWhatsapp: '+8801812345672',
        role: 'Sr. Specialist'
      }
    ]
  },
  {
    id: 'st-3',
    name: 'Graphics Design',
    shift: 'Night Shift',
    updatedAt: 'Oct 06, 2026 · 7:26 AM',
    members: [
      {
        id: 'mem-3',
        name: 'Naimul Islam Tasin',
        initials: 'NI',
        phoneWhatsapp: '+8801912345673',
        role: 'Visual Designer'
      },
      {
        id: 'mem-4',
        name: 'MD SAYHAM JAMAN ADIL',
        initials: 'SA',
        phoneWhatsapp: '+8801612345674',
        role: 'UI Designer'
      }
    ]
  },
  {
    id: 'st-4',
    name: 'META + SMM',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:35 AM',
    members: [
      {
        id: 'mem-5',
        name: 'Rokibul Islam 👾',
        initials: 'RI',
        phoneWhatsapp: '+8801512345675',
        role: 'Meta Ads Lead'
      },
      {
        id: 'mem-6',
        name: 'Abdullah Bin Sadiq',
        initials: 'AS',
        phoneWhatsapp: '+8801712345676',
        role: 'SMM Campaigner'
      },
      {
        id: 'mem-7',
        name: 'Sanjida Sultana Snigdha 👻',
        initials: 'SS',
        phoneWhatsapp: '+8801812345677',
        role: 'Creative Copy & Content'
      }
    ]
  },
  {
    id: 'st-5',
    name: 'SEO',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:38 AM',
    members: [
      {
        id: 'mem-8',
        name: 'Md. Samiun Islam',
        initials: 'MS',
        phoneWhatsapp: '+8801912345678',
        role: 'Technical SEO'
      },
      {
        id: 'mem-9',
        name: 'Reiad',
        initials: 'R',
        phoneWhatsapp: '+8801612345679',
        role: 'Backlink Specialist'
      },
      {
        id: 'mem-10',
        name: 'Sayed Biplob Hossain',
        initials: 'SB',
        phoneWhatsapp: '+8801712345680',
        role: 'On-Page Auditor'
      }
    ]
  },
  {
    id: 'st-6',
    name: 'Google Ads',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:46 AM',
    members: [
      {
        id: 'mem-11',
        name: 'Kawsar Mahmud',
        initials: 'KM',
        phoneWhatsapp: '+8801812345681',
        role: 'Search Ads Strategist'
      },
      {
        id: 'mem-12',
        name: 'Fahim Shakil',
        initials: 'FS',
        phoneWhatsapp: '+8801912345682',
        role: 'Performance Max Lead'
      },
      {
        id: 'mem-13',
        name: 'Mahbubur Rahman',
        initials: 'MR',
        phoneWhatsapp: '+8801512345683',
        role: 'Conversion Analytics'
      }
    ]
  },
  {
    id: 'st-7',
    name: 'Shopify Dev',
    shift: 'Morning Shift',
    updatedAt: 'Oct 06, 2026 · 7:15 AM',
    members: [
      {
        id: 'mem-14',
        name: 'Md Samiul Ajom',
        initials: 'SA',
        phoneWhatsapp: '+8801711223344',
        role: 'Jr. Shopify Developer'
      },
      {
        id: 'mem-15',
        name: 'Tanvir Ahmed',
        initials: 'TA',
        phoneWhatsapp: '+8801722334455',
        role: 'Shopify Liquid Expert'
      },
      {
        id: 'mem-16',
        name: 'Zubayer Hossain',
        initials: 'ZH',
        phoneWhatsapp: '+8801733445566',
        role: 'Frontend Architect'
      }
    ]
  },
  {
    id: 'st-8',
    name: 'Wix / Webflow',
    shift: 'Night Shift',
    updatedAt: 'Oct 06, 2026 · 8:10 PM',
    members: [
      {
        id: 'mem-17',
        name: 'Fahim Chowdhury',
        initials: 'FC',
        phoneWhatsapp: '+8801744556677',
        role: 'Wix Studio Specialist'
      },
      {
        id: 'mem-18',
        name: 'Sifat Hassan',
        initials: 'SH',
        phoneWhatsapp: '+8801755667788',
        role: 'Webflow Animator'
      }
    ]
  }
];

export const initialQueues: QueueItem[] = [
  {
    id: 'qu-1',
    queueKey: 'QU-329851',
    status: 'Given',
    clientName: 'christinaslo',
    profileStore: 'ecom_store3_fiverr',
    title: 'inbox page update',
    conversationUrl: 'https://fiverr.com/inbox/christinaslo',
    submittedBy: 'Md Samiul Ajom',
    salesPerson: 'Shishir chowdhory',
    createdAt: 'about 4 hours ago',
    notes: 'Client confirmed modifications for header logo padding and product bundle discount badge.'
  },
  {
    id: 'qu-2',
    queueKey: 'QU-329849',
    status: 'Completed',
    clientName: 'anas_r_naser',
    profileStore: 'ecom_store3_fiverr',
    title: 'checkout page arabic rtl layout fixes',
    conversationUrl: 'https://fiverr.com/inbox/anas_r_naser',
    submittedBy: 'Md Samiul Ajom',
    salesPerson: 'Shishir chowdhory',
    createdAt: '1 day ago',
    notes: 'Successfully deployed CSS RTL overrides in theme.liquid.'
  }
];

export const initialComplains: ComplainItem[] = [
  {
    id: 'cmp-1',
    ticketNo: 'CMP-1049',
    clientName: 'marleamb',
    profileStore: 'sitewix_pro_Fiverr',
    category: 'Revision Conflict',
    severity: 'Medium',
    status: 'Under Investigation',
    description: 'Client reported URL attachment missing inside the delivery ZIP package. Sales TL Rifat flagged it for immediate dev review.',
    assignedLead: 'Tuhin',
    reportedBy: 'Rifat (Sales)',
    date: '05 Oct, 2026 03:00 PM',
    orderUrl: 'https://fiverr.com/orders/FO81729014',
    resolutionNote: 'Abir is generating clean direct links without password protection.'
  },
  {
    id: 'cmp-2',
    ticketNo: 'CMP-1042',
    clientName: 'brandi737',
    profileStore: 'web_mania_Fiverr',
    category: 'Late Delivery',
    severity: 'Low',
    status: 'Resolved',
    description: 'Client was anxious about delivery timer having only 4 hours remaining. Provided milestone preview and requested 24-hr extension smoothly.',
    assignedLead: 'Sakib - CMS',
    reportedBy: 'Meem',
    date: '04 Oct, 2026 11:15 AM',
    orderUrl: 'https://fiverr.com/orders/FO9281920',
    resolutionNote: 'Client accepted extension gracefully. Project delivered and approved.'
  }
];

export const initialStores: StoreAccount[] = [
  {
    id: 'str-1',
    name: 'ecom_store3_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'Shopi_Day',
    lead: 'Md Samiul Ajom',
    activeOrders: 14,
    health: 'Excellent',
    inboxUnread: 3,
    monthlyRevenueTarget: '$6,200'
  },
  {
    id: 'str-2',
    name: 'web_mania_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'CMS_Day',
    lead: 'Sakib - CMS',
    activeOrders: 9,
    health: 'Good',
    inboxUnread: 1,
    monthlyRevenueTarget: '$4,500'
  },
  {
    id: 'str-3',
    name: 'pagetecho_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'Shopi_Day',
    lead: 'Sushmoy',
    activeOrders: 18,
    health: 'Excellent',
    inboxUnread: 0,
    monthlyRevenueTarget: '$8,900'
  },
  {
    id: 'str-4',
    name: 'sitewix_pro_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'Wix_Day',
    lead: 'Tuhin',
    activeOrders: 7,
    health: 'At Risk',
    inboxUnread: 4,
    monthlyRevenueTarget: '$3,800'
  },
  {
    id: 'str-5',
    name: 'ppc_buddy_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'Shopi_Day',
    lead: 'Sushmoy',
    activeOrders: 11,
    health: 'Good',
    inboxUnread: 2,
    monthlyRevenueTarget: '$5,100'
  },
  {
    id: 'str-6',
    name: 'smmtech_Fiverr',
    platform: 'Fiverr',
    assignedTeam: 'Design_Team',
    lead: 'Sakib - CMS',
    activeOrders: 8,
    health: 'Good',
    inboxUnread: 1,
    monthlyRevenueTarget: '$3,400'
  }
];

export const initialHandovers: HandoverNote[] = [
  {
    id: 'ho-1',
    fromShift: 'Morning Shift',
    toShift: 'Night Shift',
    date: '06 Oct, 2026 07:00 PM',
    author: 'Md Samiul Ajom (Shopify Day)',
    receivedBy: 'Pending Night Lead Ack',
    status: 'Pending Ack',
    notes: 'ecom_store3_Fiverr has 2 pending revisions for anas_r_naser. Color swatches are completed in staging theme (theme_id: 149201948). Please confirm with client once online.',
    urgentTickets: ['QU-329851', 'iss-1']
  },
  {
    id: 'ho-2',
    fromShift: 'Night Shift',
    toShift: 'Morning Shift',
    date: '06 Oct, 2026 07:00 AM',
    author: 'MD SAYHAM JAMAN ADIL (Night)',
    receivedBy: 'Md Samiul Ajom',
    status: 'Acknowledged',
    notes: 'All night inbox queries cleared. Graphic banner assets for brandi737 delivered to drive folder.',
    urgentTickets: ['iss-5']
  }
];

export const initialAnnouncements: AnnouncementItem[] = [
  {
    id: 'anc-1',
    title: 'Fiverr October Level Evaluation & Response Rate Notice',
    content: 'All shifts must reply to any new buyer message within 15 minutes. Use the Quick Queue tab if you need dev assistance on a live conversation.',
    date: '05 Oct, 2026',
    tag: 'Policy',
    author: 'ScaleUp Management',
    priority: 'important'
  },
  {
    id: 'anc-2',
    title: 'Portal Release v1.0.1 Live',
    content: 'New features added: Real-time Shift Station Roster, Client Complaints tracker, Store Matrix accounts view, and Shift Handover system.',
    date: '06 Oct, 2026',
    tag: 'System',
    author: 'Team FSD',
    priority: 'normal'
  }
];
