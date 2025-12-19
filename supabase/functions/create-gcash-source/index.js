// Supabase Edge Function: create-gcash-source
// This function securely creates PayMongo GCash payment sources server-side

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

    // Parse request body
    const { amount, billing, redirect } = await req.json()

    console.log('Received request:', { amount, billing, redirect })

    // Validate required fields
    if (!amount || !billing || !redirect) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: amount, billing, redirect' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate billing address fields
    if (!billing.name || !billing.email || !billing.phone || !billing.address) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing billing fields: name, email, phone, or address required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!billing.address.line1 || !billing.address.city || !billing.address.state || !billing.address.country) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing address fields: line1, city, state, country required',
          received: billing.address
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert amount to centavos (PayMongo uses smallest currency unit)
    const amountInCentavos = Math.round(amount * 100)

    // Create PayMongo source payload
    const payload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          redirect: {
            success: redirect.success,
            failed: redirect.failed
          },
          type: 'gcash',
          currency: 'PHP',
          billing: {
            name: billing.name,
            email: billing.email,
            phone: billing.phone,
            address: {
              line1: billing.address.line1,
              line2: billing.address.line2 || '',
              city: billing.address.city,
              state: billing.address.state,
              postal_code: String(billing.address.postal_code || '1000'),
              country: billing.address.country
            }
          }
        }
      }
    }

    console.log('Creating GCash source for amount:', amountInCentavos / 100, 'PHP')
    console.log('Payload:', JSON.stringify(payload, null, 2))

    // Call PayMongo API with Basic Auth
    const authString = `${PAYMONGO_SECRET_KEY}:`
    const encodedAuth = btoa(authString)

    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedAuth}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PayMongo API error:', data)
      console.error('Status:', response.status)
      console.error('Error details:', JSON.stringify(data, null, 2))
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.errors?.[0]?.detail || 'Failed to create GCash source',
          details: data,
          status: response.status
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('GCash source created successfully:', data.data.id)

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
    console.error('Error in create-gcash-source function:', error)
    
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
