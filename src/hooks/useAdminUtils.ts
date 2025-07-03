
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminUtils = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const assignTicket = async (ticketId: string, agentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: agentId })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Ticket assigned successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Ticket status updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Ticket deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (message: string, userId?: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          message,
          user_id: userId || null,
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating activity:', error);
      return false;
    }
  };

  const getSystemStats = async () => {
    try {
      setLoading(true);
      
      const [usersResult, ticketsResult, chatRoomsResult] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('tickets').select('status', { count: 'exact' }),
        supabase.from('chat_rooms').select('status', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        tickets: ticketsResult.count || 0,
        chatRooms: chatRoomsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return { users: 0, tickets: 0, chatRooms: 0 };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    assignTicket,
    updateTicketStatus,
    deleteTicket,
    createActivity,
    getSystemStats,
  };
};
