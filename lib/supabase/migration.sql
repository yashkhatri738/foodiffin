-- ═══════════════════════════════════════════════════════════════
-- Foodiffin: Profiles & Restaurants Migration
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  address TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Restaurants policies
CREATE POLICY "Users can view their own restaurants"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own restaurants"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own restaurants"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = owner_id);

-- 3. Storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');

CREATE POLICY "Anyone can view restaurant images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "Users can delete their own restaurant images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'restaurant-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Store settings columns in restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS min_order_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;

-- 5. Tiffin Plans table
CREATE TABLE IF NOT EXISTS public.tiffin_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_weekly NUMERIC NOT NULL,
  price_monthly NUMERIC NOT NULL,
  meal_type TEXT DEFAULT 'Veg', -- Veg, Non-Veg
  items TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for tiffin_plans
ALTER TABLE public.tiffin_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiffin_plans
CREATE POLICY "Anyone can view tiffin plans"
  ON public.tiffin_plans FOR SELECT
  USING (is_available = true OR auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

CREATE POLICY "Restaurant owner can insert tiffin plans"
  ON public.tiffin_plans FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

CREATE POLICY "Restaurant owner can update tiffin plans"
  ON public.tiffin_plans FOR UPDATE
  USING (auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

CREATE POLICY "Restaurant owner can delete tiffin plans"
  ON public.tiffin_plans FOR DELETE
  USING (auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

-- 6. Tiffin Subscriptions table
CREATE TABLE IF NOT EXISTS public.tiffin_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.tiffin_plans(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, completed, cancelled
  delivery_time TEXT DEFAULT 'lunch', -- lunch, dinner, both
  address JSONB NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for tiffin_subscriptions
ALTER TABLE public.tiffin_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiffin_subscriptions
CREATE POLICY "Users can view their own tiffin subscriptions"
  ON public.tiffin_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

CREATE POLICY "Users can insert their own tiffin subscriptions"
  ON public.tiffin_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users/Owners can update their own tiffin subscriptions"
  ON public.tiffin_subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = restaurant_id
  ));

-- 7. Add rating columns to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS rating_sum NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2,1) DEFAULT 4.8;

-- 8. Create unified restaurant analytics view
CREATE OR REPLACE VIEW public.restaurant_dashboard_analytics 
WITH (security_invoker = true) AS
SELECT 
  r.id AS restaurant_id,
  r.name AS restaurant_name,
  
  -- Calculate revenue from paid, non-cancelled orders
  COALESCE((
    SELECT SUM(o.total_amount) 
    FROM public.orders o 
    WHERE o.restaurant_id = r.id AND o.payment_status = 'paid' AND o.status != 'cancelled'
  ), 0) AS total_revenue,

  -- Count total orders
  COALESCE((
    SELECT COUNT(o.id) 
    FROM public.orders o 
    WHERE o.restaurant_id = r.id
  ), 0) AS total_orders_count,

  -- Count active orders (not delivered and not cancelled)
  COALESCE((
    SELECT COUNT(o.id) 
    FROM public.orders o 
    WHERE o.restaurant_id = r.id AND o.status != 'delivered' AND o.status != 'cancelled'
  ), 0) AS active_orders_count,

  -- Calculate average prep time from dishes
  COALESCE((
    SELECT ROUND(AVG(d.preparation_time)) 
    FROM public.dishes d 
    WHERE d.restaurant_id = r.id AND d.preparation_time IS NOT NULL
  ), 20) AS avg_prep_time,

  -- Ratings columns from restaurants table
  COALESCE(r.average_rating, 4.8) AS average_rating,
  COALESCE(r.rating_count, 0) AS rating_count
FROM 
  public.restaurants r;
