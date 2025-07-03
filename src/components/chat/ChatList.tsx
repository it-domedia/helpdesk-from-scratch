
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ChatRoom } from "@/types/chat";

interface ChatListProps {
  chatRooms: ChatRoom[];
  selectedChat: ChatRoom | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onChatSelect: (chat: ChatRoom) => void;
  userRole: string;
}

export const ChatList = ({ 
  chatRooms, 
  selectedChat, 
  searchQuery, 
  setSearchQuery, 
  onChatSelect, 
  userRole 
}: ChatListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'waiting': return 'Waiting';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    const customerName = room.customer?.name?.toLowerCase() || '';
    const customerEmail = room.customer?.email?.toLowerCase() || '';
    const agentName = room.agent?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return customerName.includes(query) || 
           customerEmail.includes(query) || 
           agentName.includes(query);
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {userRole === 'customer' ? 'Support Chat' : `Support Conversations (${filteredChatRooms.length})`}
        </h2>
        {userRole !== 'customer' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="overflow-y-auto">
        {filteredChatRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onChatSelect(room)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChat?.id === room.id ? "bg-indigo-50 border-indigo-200" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">
                  {userRole === 'customer' 
                    ? (room.agent?.name || 'Support Agent') 
                    : (room.customer?.name || 'Customer')
                  }
                </h3>
                <Badge className={`${getStatusColor(room.status)} text-white text-xs`}>
                  {getStatusText(room.status)}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{formatTime(room.updated_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                {room.lastMessage || 'No messages yet'}
              </p>
              {room.unreadCount && room.unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {room.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {filteredChatRooms.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>{searchQuery ? 'No conversations match your search' : 'No conversations found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
