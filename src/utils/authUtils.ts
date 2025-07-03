
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

// Helper function to validate and convert role
export const validateRole = (role: string): 'admin' | 'agent' | 'customer' => {
  if (role === 'admin' || role === 'agent' || role === 'customer') {
    return role;
  }
  return 'customer'; // Default fallback
};

export const createProfileIfNotExists = async (authUser: User): Promise<UserProfile | null> => {
  try {
    console.log('Checking profile for user:', authUser.id);
    
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return null;
    }

    if (existingProfile) {
      console.log('Found existing profile:', existingProfile);
      // Convert the database profile to UserProfile type
      return {
        id: existingProfile.id,
        email: existingProfile.email,
        name: existingProfile.name,
        role: validateRole(existingProfile.role)
      };
    }

    // Profile doesn't exist, create it
    console.log('Creating profile for user:', authUser.id);
    const profileData = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'customer'
    };

    console.log('Profile data to insert:', profileData);

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      // If insert fails, try to fetch again in case it was created by trigger
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (retryProfile) {
        return {
          id: retryProfile.id,
          email: retryProfile.email,
          name: retryProfile.name,
          role: validateRole(retryProfile.role)
        };
      }
      return null;
    }

    console.log('Created new profile:', newProfile);
    // Convert the database profile to UserProfile type
    return {
      id: newProfile.id,
      email: newProfile.email,
      name: newProfile.name,
      role: validateRole(newProfile.role)
    };
  } catch (error) {
    console.error('Error in createProfileIfNotExists:', error);
    return null;
  }
};
