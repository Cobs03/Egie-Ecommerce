// Follow these steps to set up email notifications:
// 1. Install dependencies in your Supabase project
// 2. Create this edge function: supabase functions new send-contact-email
// 3. Deploy: supabase functions deploy send-contact-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') // Add this to your Supabase secrets
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'your-admin@email.com'

serve(async (req) => {
  try {
    const { name, email, message, phone, id } = await req.json()

    // Send email using Resend API (you can use any email service)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>', // Change to your domain
        to: [ADMIN_EMAIL],
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Submission ID: ${id}</small></p>
          <p><small>Reply to: ${email}</small></p>
        `
      })
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    // Send confirmation email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Support <onboarding@resend.dev>', // Change to your domain
        to: [email],
        subject: 'We received your message',
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Best regards,<br>Your Support Team</p>
        `
      })
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent successfully' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
