import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCouponCode, getExpiryTime } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { timestamp, ref, token } = body;

    // Token varsa dogrula ve kullanildi olarak isaretle
    if (token) {
      const { data: tokenData, error: tokenError } = await supabase
        .from('survey_tokens')
        .select('*')
        .eq('token', token.toUpperCase())
        .single();

      if (tokenError || !tokenData) {
        return NextResponse.json({ error: 'Gecersiz token' }, { status: 400 });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Token suresi dolmus' }, { status: 400 });
      }

      if (tokenData.is_used) {
        return NextResponse.json({ error: 'Token zaten kullanilmis' }, { status: 400 });
      }

      // Token'i kullanildi olarak isaretle
      await supabase
        .from('survey_tokens')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);
    }

    // Benzersiz kod olustur (cakisma kontrolu ile)
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateCouponCode();
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Kupon kodu olusturulamadi, lutfen tekrar deneyin' },
        { status: 500 }
      );
    }

    const expiresAt = getExpiryTime();

    // Veritabanina kaydet
    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code,
        expires_at: expiresAt.toISOString(),
        source_timestamp: timestamp || null,
        reference_id: ref || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Kupon olusturulurken bir hata olustu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        created_at: coupon.created_at,
        expires_at: coupon.expires_at,
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatasi' },
      { status: 500 }
    );
  }
}
