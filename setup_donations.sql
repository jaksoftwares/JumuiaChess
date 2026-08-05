-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT,
    email TEXT,
    phone_number TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    donor_message TEXT,
    payment_channel TEXT NOT NULL DEFAULT 'stk',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    checkout_request_id TEXT,
    mpesa_receipt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can donate)
CREATE POLICY "Enable insert for anyone"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only allow authenticated admins to read donations
CREATE POLICY "Enable read access for authenticated users only"
ON public.donations
FOR SELECT
TO authenticated
USING (true);
