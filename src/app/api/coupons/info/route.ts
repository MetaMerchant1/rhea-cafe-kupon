import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Kupon kodu gerekli' },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('id, code, created_at, expires_at, is_used')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { error: 'Kupon bulunamadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        created_at: coupon.created_at,
        expires_at: coupon.expires_at,
        is_used: coupon.is_used,
      },
    });
  } catch (error) {
    console.error('Coupon info error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatasi' },
      { status: 500 }
    );
  }
}
