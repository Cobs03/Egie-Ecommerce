// Supabase Edge Function: get-source-status
// This function securely retrieves PayMongo source status server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get PayMongo secret key from environment
    const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY')
    
    if (!PAYMONGO_SECRET_KEY) {
      throw new Error('PAYMONGO_SECRET_KEY not configured')
    }

    // Get sourceId from query params
    const url = new URL(req.url)
    const sourceId = url.searchParams.get('sourceId')

    if (!sourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameter: sourceId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting source status for:', sourceId)

    // Call PayMongo API with Basic Auth
    const authString = `${PAYMONGO_SECRET_KEY}:`
    const encodedAuth = btoa(authString)

    const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedAuth}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PayMongo API error:', data)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.errors?.[0]?.detail || 'Failed to get source status',
          details: data
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Source status retrieved:', data.data.attributes.status)

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        source: data.data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-source-status function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
