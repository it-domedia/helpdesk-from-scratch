
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/TicketList";
import { TicketFilters } from "@/components/TicketFilters";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CreateTicketModal } from "@/components/CreateTicketModal";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { mockActivities } from "@/data/mockData";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupabaseTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customer_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
  };
  agent?: {
    name: string;
  };
}

const Tickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Fetch tickets based on user role
  const fetchTickets = async () => {
    if (!user) return;

    setTicketsLoading(true);
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(name, email),
          agent:profiles!tickets_assigned_to_fkey(name)
        `)
        .order('created_at', { ascending: false });

      // Filter tickets based on user role
      if (user.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load tickets.",
          variant: "destructive",
        });
        return;
      }

      const formattedTickets: Ticket[] = (data as SupabaseTicket[]).map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status as any,
        priority: ticket.priority as any,
        category: ticket.category,
        customerName: ticket.customer.name,
        customerEmail: ticket.customer.email,
        assignedTo: ticket.agent?.name,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
      }));

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTicketsLoading(false);
      setLoading(false);
    }
  };

  // Fetch profiles for customer selection (for admin/agent)
  const fetchProfiles = async () => {
    if (user?.role === 'customer') {
      return;
    }
    
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'customer');
    
    if (data) {
      setProfiles(data);
    }
  };

  // Get available support agents for auto-assignment
  const getAvailableAgent = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['agent', 'admin'])
      .limit(1);
    
    return data?.[0]?.id || null;
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchProfiles();
    }
  }, [user]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = activeFilter === "all" || ticket.status === activeFilter;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      let customerId = user?.id;
      let assignedAgentId = null;

      if (user?.role === 'customer') {
        assignedAgentId = await getAvailableAgent();
      } else {
        const customer = profiles.find(p => p.email === ticketData.customerEmail);
        if (!customer) {
          toast({
            title: "Error",
            description: "Customer not found.",
            variant: "destructive",
          });
          return;
        }
        customerId = customer.id;
      }

      const { error } = await supabase
        .from('tickets')
        .insert({
          title: ticketData.title,
          description: ticketData.description,
          status: assignedAgentId ? 'assigned' : 'unassigned',
          priority: ticketData.priority,
          category: ticketData.category,
          customer_id: customerId,
          assigned_to: assignedAgentId
        });

      if (error) {
        console.error('Error creating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to create ticket.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: user?.role === 'customer' 
          ? "Ticket created successfully and assigned to support agent."
          : "Ticket created successfully.",
      });

      setShowCreateModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          title: updatedTicket.title,
          description: updatedTicket.description,
          status: updatedTicket.status,
          priority: updatedTicket.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTicket.id);

      if (error) {
        console.error('Error updating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Ticket updated successfully.",
      });

      setSelectedTicket(updatedTicket);
      fetchTickets();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getFilterCounts = () => {
    return {
      unassigned: tickets.filter(t => t.status === 'unassigned').length,
      assigned: tickets.filter(t => t.status === 'assigned').length,
      all: tickets.length,
      archive: tickets.filter(t => t.status === 'closed').length,
    };
  };

  // Show skeleton loading only on initial load
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'customer' ? 'My Tickets' : 'Tickets'}
              </h1>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {user?.role === 'customer' ? 'Create ticket' : 'New ticket'}
              </Button>
            </div>
            
            <TicketFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterCounts={getFilterCounts()}
            />
            
            <div className="mt-6">
              {ticketsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <TicketList 
                  tickets={filteredTickets}
                  onTicketClick={handleTicketClick}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="w-80 p-6">
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
        customers={profiles}
      />

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
        />
      )}
    </div>
  );
};

export default Tickets;
