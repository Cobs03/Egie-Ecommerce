// Supabase Edge Function for sending contact reply emails via Resend
// Deploy this to: supabase/functions/send-contact-reply/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    const { to, customerName, subject, message, submissionId } = await req.json()

    console.log('📧 Received request:', { to, customerName, subject, submissionId })
    console.log('🔑 API Key exists:', !!RESEND_API_KEY)

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in Supabase secrets')
    }

    // Validate inputs
    if (!to || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to and message' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Send email to customer using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Egie PC Store <onboarding@resend.dev>', // Using Resend's free tier domain
        to: [to],
        subject: subject || 'Re: Your inquiry',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
              .message { background: #f9fafb; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Egie PC Store</h1>
                <p>Customer Support Response</p>
              </div>
              <div class="content">
                <p>Hi ${customerName || 'there'},</p>
                <div class="message">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p>If you have any further questions, feel free to reply to this email.</p>
                <p>Best regards,<br><strong>Egie PC Store Team</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Egie PC Store. All rights reserved.</p>
                <p>This is an automated response to your inquiry.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hi ${customerName || 'there'},\n\n${message}\n\nIf you have any further questions, feel free to reply to this email.\n\nBest regards,\nEgie PC Store Team`
      })
    })

    const emailData = await emailResponse.json()

    console.log('📬 Resend API response status:', emailResponse.status)
    console.log('📬 Resend API response:', emailData)

    if (!emailResponse.ok) {
      console.error('❌ Resend API error:', emailData)
      throw new Error(emailData.message || 'Failed to send email via Resend')
    }

    console.log('✅ Email sent successfully:', emailData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Error in send-contact-reply function:', error)
    console.error('💥 Error message:', error.message)
    console.error('💥 Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
