import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export type VerifyResult = {
  valid: boolean;
  message: string;
  status: 'valid' | 'used' | 'expired' | 'not_found';
  coupon?: {
    code: string;
    created_at: string;
    expires_at: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json<VerifyResult>({
        valid: false,
        message: 'Kupon kodu gerekli',
        status: 'not_found',
      });
    }

    // Kodu temizle (bosluklar ve kucuk/buyuk harf)
    const cleanCode = code.trim().toUpperCase();

    // Kuponu bul
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !coupon) {
      return NextResponse.json<VerifyResult>({
        valid: false,
        message: 'Kupon bulunamadi',
        status: 'not_found',
      });
    }

    // Zaten kullanilmis mi?
    if (coupon.is_used) {
      return NextResponse.json<VerifyResult>({
        valid: false,
        message: 'Bu kupon zaten kullanilmis',
        status: 'used',
        coupon: {
          code: coupon.code,
          created_at: coupon.created_at,
          expires_at: coupon.expires_at,
        },
      });
    }

    // Suresi dolmus mu?
    const expiresAt = new Date(coupon.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json<VerifyResult>({
        valid: false,
        message: 'Kupon suresi dolmus',
        status: 'expired',
        coupon: {
          code: coupon.code,
          created_at: coupon.created_at,
          expires_at: coupon.expires_at,
        },
      });
    }

    // Kuponu kullanildi olarak isaretle
    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', coupon.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Kupon guncellenirken hata olustu' },
        { status: 500 }
      );
    }

    return NextResponse.json<VerifyResult>({
      valid: true,
      message: 'Kupon gecerli! Indirim uygulanabilir.',
      status: 'valid',
      coupon: {
        code: coupon.code,
        created_at: coupon.created_at,
        expires_at: coupon.expires_at,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatasi' },
      { status: 500 }
    );
  }
}
