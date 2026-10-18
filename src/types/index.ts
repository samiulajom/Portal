export type NavTab = 
  | 'overview' 
  | 'issues' 
  | 'updates' 
  | 'stations' 
  | 'complains' 
  | 'queue' 
  | 'stores' 
  | 'handover'
  | 'access';

// Permission keys for granular access control
export type PermissionKey =
  // Module View Access
  | 'view_overview'
  | 'view_issues'
  | 'view_updates'
  | 'view_stations'
  | 'view_complains'
  | 'view_queue'
  | 'view_stores'
  | 'view_handover'
  | 'manage_access'
  // Action Permissions
  | 'create_queue'
  | 'process_queue'
  | 'delete_queue'
  | 'create_issues'
  | 'resolve_issues'
  // Update Sheet Granular Feature Permissions
  | 'create_updates'
  | 'edit_updates'
  | 'delete_updates'
  | 'approve_updates'
  | 'send_updates'
  | 'reopen_updates'
  | 'export_updates'
  | 'view_completed_updates'
  | 'view_message_details'
  | 'edit_operation_comment'
  | 'edit_sales_comment'
  | 'manage_stations'
  | 'manage_station_members'
  | 'create_complains'
  | 'resolve_complains'
  | 'manage_stores'
  | 'create_handover'
  | 'acknowledge_handover'
  | 'export_data'
  | 'delete_records'
  // Overview Dashboard Granular Sections
  | 'overview_view_kpi'
  | 'overview_view_operations_wip'
  | 'overview_view_sales_updates'
  | 'overview_view_velocity'
  | 'overview_view_stations_spotlight'
  | 'overview_view_recent_activity';

export interface RoleDefinition {
  id: string;
  name: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  isSystem?: boolean;
  permissions: Record<PermissionKey, boolean>;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  avatarText: string;
  roleId: string; // references RoleDefinition.id
  department: string;
  shift: string;
  phoneWhatsapp?: string;
  isClockedIn?: boolean;
  clockInTime?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  useCustomPermissions?: boolean; // If true, customPermissions overrides role's default
  customPermissions?: Partial<Record<PermissionKey, boolean>>;
}

export interface AccessAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 'UPDATE_ROLE' | 'UPDATE_USER_PERMISSIONS' | 'CREATE_USER' | 'DELETE_USER' | 'CREATE_ROLE' | 'RESET_PERMISSIONS';
  targetName: string;
  details: string;
}

// Global Team Directory — members saved once, assigned to stations as needed
export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  phoneWhatsapp?: string;
  role?: string;
  profileNames?: string[];
}


export type IssueStatus = 'open' | 'in progress' | 'done';
export type ServiceType = 'CMS' | 'Shopify' | 'Wix' | 'WordPress' | 'Webflow' | 'SquareSpace' | 'SEO' | 'Design' | 'Google Ads' | 'Meta Ads' | string;
export type TeamType = 
  | 'Shopify_Zen' 
  | 'WP_Titans' 
  | 'NextGen_WP' 
  | 'WP Knight_Riders' 
  | 'WIX_Spark' 
  | 'Shopi_Day' 
  | 'Webflow' 
  | 'Square Space' 
  | string;

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AttachmentUrlItem {
  id: string;
  label: string;
  url: string;
}

export interface IssueItem {
  id: string;
  date: string;
  profile: string;
  clientName: string;
  orderId?: string;
  service: ServiceType;
  team: TeamType;
  specialNotes?: string;
  orderPageUrl?: string;
  inboxPageUrl?: string;
  fileMeetingLink?: string;
  assignedPerson?: string;
  riskLevel?: RiskLevel;
  salesNote?: string;
  attachmentUrls?: AttachmentUrlItem[];
  status: IssueStatus;
  reportedBy?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  resolutionNote?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface UpdateEntry {
  id: string;
  date: string;
  profile: string;
  clientName: string;
  orderId?: string;
  attachments?: string;
  updateBy: string;
  message: string;
  commentOperation?: string;
  commentSales?: string;
  tlCheck: boolean;
  tlAt: string;
  updateTo: 'Inbox Page' | 'Inbox & Order' | 'Order Page' | 'Inbox Page Update' | 'Order Page Update' | 'Inbox & Order Update' | 'Revision Update' | 'Query Update' | string;
  doneBy?: string;
  status?: 'pending' | 'completed' | 'sent';
  sentAt?: string;
  sentBy?: string;
}

export type ShiftType = 'Morning Shift' | 'Evening Shift' | 'Night Shift';

export interface StationMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  phoneWhatsapp?: string;
  role?: string;
  profileNames?: string[];
}

export interface SavedMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  phoneWhatsapp?: string;
  role?: string;
  profileNames?: string[];
  department?: string;
}

export interface StationGroup {
  id: string;
  name: string;
  shift: ShiftType;
  updatedAt: string;
  members: StationMember[];
  dutyContact?: StationMember;
}

export type QueueStatus = 'Requested' | 'Given';

export interface QueueUpdateLink {
  id: string;
  label?: string;
  url: string;
}

export interface QueueUpdate {
  id: string;
  createdAt: string;
  salesPerson: string;
  comment: string;
  inboxUrl?: string;
  orderPageUrl?: string;
  imageUrl?: string;
  imageName?: string;
  otherLinks?: QueueUpdateLink[];
  statusChange?: QueueStatus;
}

export interface QueueItem {
  id: string;
  queueKey: string; // e.g. QU-329851
  status: QueueStatus;
  priority?: 'Normal' | 'Urgent';
  department?: string; // e.g. 'Operation'
  orderId?: string; // e.g. FO38920194 or custom order number
  clientName: string;
  profileStore: string;
  title: string;
  conversationUrl?: string;
  orderPageUrl?: string;
  submittedBy: string;
  salesPerson: string;
  createdAt: string;
  notes?: string;
  imageUrl?: string; // Request screenshot or attachment (e.g. image.png)
  imageName?: string; // filename e.g. "image.png"
  updates?: QueueUpdate[];
}

export type ComplainSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplainStatus = 'Open' | 'Under Investigation' | 'Mediation' | 'Resolved' | 'Refunded';

export interface ComplainItem {
  id: string;
  ticketNo: string;
  clientName: string;
  profileStore: string;
  category: 'Late Delivery' | 'Communication Gap' | 'Quality Issue' | 'Revision Conflict' | 'Order Cancellation Risk';
  severity: ComplainSeverity;
  status: ComplainStatus;
  description: string;
  assignedLead: string;
  reportedBy: string;
  date: string;
  orderUrl?: string;
  resolutionNote?: string;
}

export interface StoreAccount {
  id: string;
  name: string;
  platform: 'Fiverr' | 'Upwork' | 'Shopify Partner' | 'Direct Client';
  assignedTeam: TeamType;
  lead: string;
  activeOrders: number;
  health: 'Excellent' | 'Good' | 'At Risk' | 'Warming Up';
  inboxUnread: number;
  monthlyRevenueTarget?: string;
}

export interface HandoverNote {
  id: string;
  fromShift: ShiftType;
  toShift: ShiftType;
  date: string;
  author: string;
  receivedBy?: string;
  status: 'Pending Ack' | 'Acknowledged';
  notes: string;
  urgentTickets: string[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: string;
  author: string;
  priority: 'normal' | 'important';
}
