-- Add database trigger to call edge function when new contact submission is created
-- This will automatically send email notifications

CREATE OR REPLACE FUNCTION notify_new_contact_submission()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Prepare payload for edge function
  payload := json_build_object(
    'id', NEW.id,
    'name', NEW.name,
    'email', NEW.email,
    'message', NEW.message,
    'phone', NEW.phone
  );

  -- Call edge function (you need to set this up in Supabase)
  -- Option 1: Use pg_net extension (if available)
  -- PERFORM net.http_post(
  --   url := 'YOUR_SUPABASE_URL/functions/v1/send-contact-email',
  --   headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
  --   body := payload::jsonb
  -- );

  -- Option 2: Send notification that can be picked up by your backend
  PERFORM pg_notify('new_contact_submission', payload::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_new_contact_submission ON public.contact_submissions;
CREATE TRIGGER trigger_notify_new_contact_submission
AFTER INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION notify_new_contact_submission();

-- Add comment
COMMENT ON FUNCTION notify_new_contact_submission() IS 'Sends notification when new contact form is submitted';
