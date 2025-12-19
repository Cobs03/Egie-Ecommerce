// Supabase Edge Function: create-payment
// This function securely creates PayMongo payments from sources server-side

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
    const { amount, sourceId, description } = await req.json()

    // Validate required fields
    if (!amount || !sourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: amount, sourceId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert amount to centavos
    const amountInCentavos = Math.round(amount * 100)

    // Create PayMongo payment payload
    const payload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          source: {
            id: sourceId,
            type: 'source'
          },
          currency: 'PHP',
          description: description || 'Payment'
        }
      }
    }

    console.log('Creating payment for source:', sourceId)

    // Call PayMongo API with Basic Auth
    const authString = `${PAYMONGO_SECRET_KEY}:`
    const encodedAuth = btoa(authString)

    const response = await fetch(`${PAYMONGO_API_URL}/payments`, {
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.errors?.[0]?.detail || 'Failed to create payment',
          details: data
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Payment created successfully:', data.data.id)

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: data.data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-payment function:', error)
    
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
