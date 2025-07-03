
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'unassigned' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'assigned' | 'status_changed' | 'commented' | 'resolved';
  ticketId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
}
