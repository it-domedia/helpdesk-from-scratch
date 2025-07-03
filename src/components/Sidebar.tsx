import { Calendar, Home, Inbox, Search, Settings, TicketIcon, Users, BarChart3, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

const adminSidebarItems = [
  {
    title: "Overview",
    url: "/",
    icon: Home,
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: TicketIcon,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const customerSidebarItems = [
  {
    title: "My Tickets",
    url: "/tickets",
    icon: TicketIcon,
  },
  {
    title: "Chat Support",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = user?.role === 'customer' ? customerSidebarItems : adminSidebarItems;
  const logoText = user?.role === 'customer' ? 'Support' : 'Helpdesk';

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.role === 'customer' ? 'S' : 'H'}
            </span>
          </div>
          <span className="text-xl font-semibold text-gray-900">{logoText}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <Link
                  to={item.url}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <UserMenu />
      </div>
    </div>
  );
}
