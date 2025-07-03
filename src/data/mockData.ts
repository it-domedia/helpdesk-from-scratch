
import { ActivityItem } from "@/types/ticket";

export const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "created",
    ticketId: "123",
    userName: "John Smith",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    message: "created Bug Report #123",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: "2",
    type: "status_changed", 
    ticketId: "456",
    userName: "Sarah Wilson",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    message: "updated Feature Request #456",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: "3",
    type: "resolved",
    ticketId: "789", 
    userName: "Mike Johnson",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    message: "closed Support Request #789",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];
