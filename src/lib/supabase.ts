import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase ortam degiskenleri eksik. .env.local dosyasini kontrol edin.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Geriye uyumluluk icin (lazy initialization)
export const supabase = {
  from: (table: string) => getSupabase().from(table),
};

export type Coupon = {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
  source_timestamp: string | null;
  reference_id: string | null;
};

export type CouponStatus = 'active' | 'used' | 'expired';

export function getCouponStatus(coupon: Coupon): CouponStatus {
  if (coupon.is_used) return 'used';
  if (new Date(coupon.expires_at) < new Date()) return 'expired';
  return 'active';
}
