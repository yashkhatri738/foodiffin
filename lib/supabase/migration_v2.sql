-- ═══════════════════════════════════════════════════════════════
-- Foodiffin: Daily Sales & Profit Management Migration (V2)
-- Run this in your Supabase SQL Editor to support finance routes
-- ═══════════════════════════════════════════════════════════════

-- 1. Add cost price to dishes to track ingredient cost
ALTER TABLE public.dishes 
ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;

-- 2. Add cost price to tiffin plans
ALTER TABLE public.tiffin_plans 
ADD COLUMN IF NOT EXISTS cost_price_weekly NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_price_monthly NUMERIC DEFAULT 0;

-- 3. Add commission and payout details to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS platform_commission_pct NUMERIC DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS platform_commission_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_cost_share NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_payout_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending';

-- 4. Enable delivery partner ID on orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Add latitude & longitude coordinates to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 6. Add rider-specific details to user profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_no TEXT,
ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
