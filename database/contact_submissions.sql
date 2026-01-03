-- Create contact_submissions table to store contact form messages
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  phone TEXT,
  accepted_terms BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  replied_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy: Authenticated users can read all submissions
-- Note: You can restrict this further based on your auth system
CREATE POLICY "Authenticated users can read contact submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (true);

-- Policy: Authenticated users can update submissions
-- Note: You can restrict this further based on your auth system
CREATE POLICY "Authenticated users can update contact submissions" 
ON public.contact_submissions 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_contact_submission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contact_submission_updated_at_trigger ON public.contact_submissions;
CREATE TRIGGER update_contact_submission_updated_at_trigger
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_contact_submission_updated_at();

-- Add comment to table
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions from website visitors';
