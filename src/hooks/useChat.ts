import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useChat = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('chat_rooms')
        .select(`
          *,
          customer:profiles!customer_id(name, email),
          agent:profiles!agent_id(name, email)
        `)
        .order('updated_at', { ascending: false });

      if (user.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        toast({ title: 'Error', description: 'Failed to load chat rooms', variant: 'destructive' });
        return;
      }

      const transformedData: ChatRoom[] = (data || []).map(room => ({
        id: room.id,
        customer_id: room.customer_id,
        agent_id: room.agent_id,
        status: room.status as 'active' | 'waiting' | 'closed',
        created_at: room.created_at,
        updated_at: room.updated_at,
        customer: room.customer,
        agent: room.agent
      }));

      setChatRooms(transformedData);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatRoomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!sender_id(name, role)
      `)
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
  };

  const getOrCreateChatRoom = async () => {
    if (!user || user.role !== 'customer') return null;

    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('customer_id', user.id)
      .maybeSingle();

    if (existingRoom) return existingRoom;

    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({ customer_id: user.id, status: 'waiting' })
      .select()
      .single();

    if (createError) {
      toast({ title: 'Error', description: 'Failed to create chat room', variant: 'destructive' });
      return null;
    }

    return newRoom;
  };

  const sendMessage = async (chatRoomId: string, message: string) => {
    if (!user || !message.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: user.id,
        message: message.trim()
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }

    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatRoomId);
  };

  const updateChatStatus = async (
    chatRoomId: string,
    status: 'active' | 'waiting' | 'closed',
    agentId?: string
  ) => {
    if (!user || user.role === 'customer') return;

    const updateData: any = { status };
    if (agentId) updateData.agent_id = agentId;

    const { error } = await supabase
      .from('chat_rooms')
      .update(updateData)
      .eq('id', chatRoomId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update chat status', variant: 'destructive' });
    }
  };

  // ✅ Real-time: Subscribe to current chat room messages only
  useEffect(() => {
    if (!user || !selectedChat?.id) return;

    const channel = supabase
      .channel(`chat-messages-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${selectedChat.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages(prev => [...prev, newMessage]);

          if (newMessage.sender_id !== user.id) {
            toast({ title: 'New Message', description: 'You have a new message' });
          }

          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedChat?.id]);

  // Real-time: Subscribe to chat room updates (status/assignment)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chat-rooms-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: user.role === 'customer' ? `customer_id=eq.${user.id}` : undefined
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Initial data load
  useEffect(() => {
    if (user) fetchChatRooms();
  }, [user]);

  // Auto-create/select for customer
  useEffect(() => {
    if (user?.role === 'customer' && chatRooms.length === 0 && !loading) {
      getOrCreateChatRoom().then((room) => {
        if (room) fetchChatRooms();
      });
    } else if (user?.role === 'customer' && chatRooms.length === 1 && !selectedChat) {
      setSelectedChat(chatRooms[0]);
    }
  }, [user, chatRooms.length, loading, selectedChat]);

  // Load messages on selected chat change
  useEffect(() => {
    if (selectedChat?.id) fetchMessages(selectedChat.id);
  }, [selectedChat?.id]);

  return {
    chatRooms,
    selectedChat,
    setSelectedChat,
    messages,
    loading,
    sendMessage,
    updateChatStatus,
    fetchChatRooms
  };
};
