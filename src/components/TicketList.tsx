
import { Ticket } from "@/types/ticket";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-blue-100 text-blue-800", 
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors = {
  unassigned: "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
          onClick={() => onTicketClick?.(ticket)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {ticket.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <Badge className={priorityColors[ticket.priority]} variant="secondary">
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </Badge>
                <span>#{ticket.id}</span>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>2</span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>{formatDistanceToNow(ticket.createdAt, { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
