-- ═══════════════════════════════════════════════════════════════
-- Foodiffin: Real-time Live Tracking & Subscription Pauses Migration (V3)
-- Run this script in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Add active coordinates and tracking details to profiles for riders
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS live_latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS live_longitude NUMERIC(11, 8),
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;

-- 2. Ensure orders table has delivery_partner_id column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Create subscription pauses table
CREATE TABLE IF NOT EXISTS public.subscription_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.tiffin_subscriptions(id) ON DELETE CASCADE,
  pause_start_date DATE NOT NULL,
  pause_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_subscription_pause UNIQUE (subscription_id, pause_start_date)
);

-- 4. Enable RLS for subscription_pauses
ALTER TABLE public.subscription_pauses ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies if they exist before creating
DROP POLICY IF EXISTS "Users can view pauses for their own subscriptions" ON public.subscription_pauses;
CREATE POLICY "Users can view pauses for their own subscriptions"
  ON public.subscription_pauses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.tiffin_subscriptions WHERE id = subscription_id
    ) OR
    auth.uid() IN (
      SELECT owner_id FROM public.restaurants WHERE id IN (
        SELECT restaurant_id FROM public.tiffin_subscriptions WHERE id = subscription_id
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage pauses for their own subscriptions" ON public.subscription_pauses;
CREATE POLICY "Users can manage pauses for their own subscriptions"
  ON public.subscription_pauses FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.tiffin_subscriptions WHERE id = subscription_id
    )
  );

-- 5. Safely add tables to real-time publication (prevents duplicate_object error)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;
