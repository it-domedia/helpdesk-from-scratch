
import { supabase } from '@/integrations/supabase/client';
import { AuthResult } from '@/types/auth';

export const useAuthOperations = () => {
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Check for specific error types
        if (error.message === 'Invalid login credentials') {
          return {
            success: false,
            error: {
              code: 'invalid_credentials',
              message: 'Invalid login credentials'
            }
          };
        } else if (error.message === 'Email not confirmed') {
          return {
            success: false,
            error: {
              code: 'email_not_confirmed',
              message: 'Email not confirmed'
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: error.name?.toLowerCase() || 'auth_error',
              message: error.message
            }
          };
        }
      }
      
      console.log('Login successful:', data.user?.id);
      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred'
        }
      };
    }
  };

  const signup = async (email: string, password: string, name: string, role: string): Promise<AuthResult> => {
    try {
      console.log('Attempting signup for:', email, 'with role:', role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return {
          success: false,
          error: {
            code: error.name?.toLowerCase(),
            message: error.message
          }
        };
      }
      
      console.log('Signup successful:', data.user?.id);
      
      // If user is immediately confirmed (no email confirmation required)
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed');
      } else if (data.user && data.user.email_confirmed_at) {
        console.log('User created and email confirmed');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Signup exception:', error);
      return {
        success: false,
        error: {
          message: 'An unexpected error occurred'
        }
      };
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
  };

  return {
    login,
    signup,
    logout
  };
};
