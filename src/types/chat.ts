
export interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    name: string;
    role: string;
  };
}

export interface ChatRoom {
  id: string;
  customer_id: string;
  agent_id?: string;
  status: 'active' | 'waiting' | 'closed';
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    email: string;
  };
  agent?: {
    name: string;
    email: string;
  };
  messages?: Message[];
  lastMessage?: string;
  unreadCount?: number;
}
