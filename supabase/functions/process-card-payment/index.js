// Follow this setup guide: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cardDetails, billing, amount, description, metadata, returnUrl } = await req.json()

    // Get PayMongo secret key from environment
    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY')
    if (!secretKey) {
      throw new Error('PayMongo secret key not configured')
    }

    // Step 1: Create Payment Method
    console.log('Creating payment method...')
    const paymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(secretKey + ':')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'card',
            details: {
              card_number: cardDetails.number.replace(/\s/g, ''),
              exp_month: parseInt(cardDetails.exp_month),
              exp_year: parseInt(cardDetails.exp_year),
              cvc: cardDetails.cvc
            },
            billing: {
              name: billing.name,
              email: billing.email,
              phone: billing.phone || '',
              address: {
                line1: billing.address?.line1 || '',
                line2: billing.address?.line2 || '',
                city: billing.address?.city || '',
                state: billing.address?.state || '',
                postal_code: billing.address?.postal_code || '',
                country: billing.address?.country || 'PH'
              }
            }
          }
        }
      })
    })

    const paymentMethodData = await paymentMethodResponse.json()
    
    if (!paymentMethodResponse.ok) {
      console.error('PayMongo payment method error:', paymentMethodData)
      return new Response(
        JSON.stringify({
          success: false,
          error: paymentMethodData.errors?.[0]?.detail || 'Failed to create payment method'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const paymentMethodId = paymentMethodData.data.id
    console.log('Payment method created:', paymentMethodId)

    // Step 2: Create Payment Intent
    console.log('Creating payment intent...')
    const amountInCentavos = Math.round(amount * 100)
    
    const paymentIntentResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(secretKey + ':')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            payment_method_allowed: ['card'],
            payment_method_options: {
              card: {
                request_three_d_secure: 'any'
              }
            },
            currency: 'PHP',
            description: description,
            statement_descriptor: 'Egie Store',
            metadata: metadata || {}
          }
        }
      })
    })

    const paymentIntentData = await paymentIntentResponse.json()
    
    if (!paymentIntentResponse.ok) {
      console.error('PayMongo payment intent error:', paymentIntentData)
      return new Response(
        JSON.stringify({
          success: false,
          error: paymentIntentData.errors?.[0]?.detail || 'Failed to create payment intent'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const paymentIntentId = paymentIntentData.data.id
    console.log('Payment intent created:', paymentIntentId)

    // Step 3: Attach Payment Method to Payment Intent
    console.log('Attaching payment method to intent...')
    const attachResponse = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(secretKey + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: paymentIntentData.data.attributes.client_key,
              return_url: returnUrl || 'https://yourdomain.com/payment/callback'
            }
          }
        })
      }
    )

    const attachData = await attachResponse.json()
    
    if (!attachResponse.ok) {
      console.error('PayMongo attach error:', attachData)
      return new Response(
        JSON.stringify({
          success: false,
          error: attachData.errors?.[0]?.detail || 'Failed to attach payment method'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Payment method attached successfully')
    console.log('Payment status:', attachData.data.attributes.status)

    // Check if 3D Secure is required
    const status = attachData.data.attributes.status
    const requires3DS = status === 'awaiting_next_action'
    const redirectUrl = requires3DS 
      ? attachData.data.attributes.next_action?.redirect?.url 
      : null

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntent: {
          id: paymentIntentId,
          status: status,
          amount: attachData.data.attributes.amount,
          currency: attachData.data.attributes.currency,
          client_key: attachData.data.attributes.client_key
        },
        requires3DS: requires3DS,
        redirectUrl: redirectUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
