
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'customer';
}

export interface AuthResult {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string, role: string) => Promise<AuthResult>;
  logout: () => void;
  isLoading: boolean;
}
