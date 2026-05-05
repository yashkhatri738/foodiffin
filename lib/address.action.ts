'use server'

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export interface AddressData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: 'home' | 'office' | 'other';
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export async function getUserAddress() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    return { error: error.message };
  }

  return { data };
}

export async function saveOrUpdateAddress(addressData: AddressData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if user already has an address
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingAddress) {
    // Update existing address
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', existingAddress.id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/checkout');
    return { data, success: true };
  } else {
    // Create new address
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...addressData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/checkout');
    return { data, success: true };
  }
}
