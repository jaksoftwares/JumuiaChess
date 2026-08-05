-- Run this in your Supabase SQL Editor to upgrade the e-commerce module

-- Add logistics and fulfillment columns to the shop_orders table
ALTER TABLE public.shop_orders 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- For good measure, ensure RLS policies exist
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'shop_orders' AND policyname = 'Enable insert for shop orders'
    ) THEN
        CREATE POLICY "Enable insert for shop orders"
        ON public.shop_orders
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);
    END IF;
END $$;
