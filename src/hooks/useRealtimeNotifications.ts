
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time notifications for user:', user.id);

    // Subscribe to new messages for notifications
    const messagesChannel = supabase
      .channel('notification-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Only show notifications for messages from others
          if (newMessage.sender_id !== user.id) {
            // Get sender info
            const { data: senderData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newMessage.sender_id)
              .single();

            const senderName = senderData?.name || 'Someone';
            
            showNotification('New Message', {
              body: `${senderName}: ${newMessage.message}`,
              tag: 'chat-message',
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to chat room status changes
    const roomsChannel = supabase
      .channel('notification-rooms')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          const updatedRoom = payload.new as any;
          
          // Notify customer when agent joins
          if (user.role === 'customer' && 
              updatedRoom.customer_id === user.id && 
              updatedRoom.status === 'active' && 
              updatedRoom.agent_id) {
            showNotification('Support Agent Connected', {
              body: 'A support agent has joined your chat',
              tag: 'agent-joined'
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, [user?.id,]);
};
