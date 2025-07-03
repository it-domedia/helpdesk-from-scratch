import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Define the initial users to create
    const initialUsers = [
      {
        email: 'mohammadddigham@gmail.com',
        password: 'admin123456',
        name: 'Mohammad Digham',
        role: 'admin'
      },
      {
        email: 'abudosh2@gmail.com',
        password: 'customer123456',
        name: 'Abu Dosh',
        role: 'customer'
      },
      {
        email: 'it@domedia.me',
        password: 'agent123456',
        name: 'IT Support',
        role: 'agent'
      }
    ]

    const results = []

    for (const userData of initialUsers) {
      try {
        console.log(`Creating user: ${userData.email}`)
        
        // Create user using admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: userData.name,
            role: userData.role,
          }
        })

        if (authError) {
          console.error(`Error creating user ${userData.email}:`, authError)
          results.push({
            email: userData.email,
            success: false,
            error: authError.message
          })
          continue
        }

        if (!authData.user) {
          console.error(`No user data returned for ${userData.email}`)
          results.push({
            email: userData.email,
            success: false,
            error: 'No user data returned'
          })
          continue
        }

        // Update the profile with the correct role and name
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            name: userData.name,
            role: userData.role,
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.warn(`Profile update failed for ${userData.email}, but user was created:`, profileError)
        }

        console.log(`Successfully created user: ${userData.email}`)
        results.push({
          email: userData.email,
          success: true,
          userId: authData.user.id,
          role: userData.role
        })

      } catch (error) {
        console.error(`Unexpected error creating user ${userData.email}:`, error)
        results.push({
          email: userData.email,
          success: false,
          error: error.message
        })
      }
    }

    // Create initial activity log
    try {
      await supabaseAdmin
        .from('activities')
        .insert({
          message: 'Initial user accounts created: Admin, Customer, and Agent',
          user_id: null
        })
    } catch (error) {
      console.warn('Failed to create initial activity log:', error)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Initial users creation completed',
        results: results,
        summary: {
          total: initialUsers.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})