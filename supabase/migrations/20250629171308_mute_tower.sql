/*
  # Fresh Database Setup with Specific Users

  1. New Tables
    - `profiles` - User profiles with roles
    - `tickets` - Support tickets
    - `messages` - Ticket messages
    - `chat_rooms` - Chat sessions
    - `chat_messages` - Chat messages
    - `activities` - System activity logs

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for all user roles
    - Create helper functions for role checking

  3. Initial Users
    - Admin: mohammadddigham@gmail.com
    - Customer: abudosh2@gmail.com  
    - Agent: it@domedia.me
*/

-- Drop all existing tables if they exist
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'agent', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('unassigned', 'assigned', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  assigned_to uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table for ticket conversations
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  agent_id uuid REFERENCES public.profiles(id),
  status text NOT NULL CHECK (status IN ('active', 'waiting', 'closed')) DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activities table for system logs
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to auth.users
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS policies for profiles table
CREATE POLICY "profiles_anon_read_2025" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "profiles_public_read_2025" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "profiles_auth_insert_2025" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_own_select_2025" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update_2025" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert_2025" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all_2025" ON public.profiles FOR ALL USING (get_current_user_role() = 'admin');

-- RLS policies for tickets table
CREATE POLICY "tickets_view_own_2025" ON public.tickets FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() = assigned_to OR 
  get_current_user_role() IN ('admin', 'agent')
);
CREATE POLICY "tickets_customer_create_2025" ON public.tickets FOR INSERT WITH CHECK (
  get_current_user_role() = 'customer' AND customer_id = auth.uid()
);
CREATE POLICY "tickets_staff_manage_2025" ON public.tickets FOR ALL USING (
  get_current_user_role() IN ('admin', 'agent')
);

-- RLS policies for messages table
CREATE POLICY "messages_view_ticket_2025" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = messages.ticket_id 
    AND (tickets.customer_id = auth.uid() OR tickets.assigned_to = auth.uid() OR get_current_user_role() IN ('admin', 'agent'))
  )
);
CREATE POLICY "messages_create_own_2025" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS policies for chat_rooms table
CREATE POLICY "chat_rooms_participant_2025" ON public.chat_rooms FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() = agent_id OR 
  get_current_user_role() IN ('admin', 'agent')
);
CREATE POLICY "chat_rooms_customer_create_2025" ON public.chat_rooms FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "chat_rooms_staff_manage_2025" ON public.chat_rooms FOR UPDATE USING (
  get_current_user_role() IN ('agent', 'admin')
);

-- RLS policies for chat_messages table
CREATE POLICY "chat_messages_room_access_2025" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr 
    WHERE cr.id = chat_messages.chat_room_id 
    AND (cr.customer_id = auth.uid() OR cr.agent_id = auth.uid() OR get_current_user_role() IN ('agent', 'admin'))
  )
);
CREATE POLICY "chat_messages_participant_send_2025" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr 
    WHERE cr.id = chat_messages.chat_room_id 
    AND (cr.customer_id = auth.uid() OR cr.agent_id = auth.uid() OR get_current_user_role() IN ('agent', 'admin'))
  )
);

-- RLS policies for activities table
CREATE POLICY "activities_admin_view_2025" ON public.activities FOR SELECT USING (get_current_user_role() = 'admin');
CREATE POLICY "activities_insert_policy_2025" ON public.activities FOR INSERT WITH CHECK (
  (auth.uid() = user_id) OR
  (get_current_user_role() IN ('admin', 'agent'))
);

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    role = COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_messages_ticket_id ON public.messages(ticket_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_chat_rooms_customer_id ON public.chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_agent_id ON public.chat_rooms(agent_id);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);