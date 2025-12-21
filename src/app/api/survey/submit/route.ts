import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCouponCode, getExpiryTime } from '@/lib/utils';

interface SurveySubmission {
  service_rating: number;
  liked_drinks: boolean;
  suggestions: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SurveySubmission = await request.json();

    // Validasyon
    if (!body.service_rating || body.service_rating < 1 || body.service_rating > 5) {
      return NextResponse.json(
        { error: 'Hizmet puani 1-5 arasi olmali' },
        { status: 400 }
      );
    }

    if (typeof body.liked_drinks !== 'boolean') {
      return NextResponse.json(
        { error: 'Icecek tercihi belirtilmeli' },
        { status: 400 }
      );
    }

    if (!body.suggestions || body.suggestions.trim().length === 0) {
      return NextResponse.json(
        { error: 'Lutfen onerinizi yazin' },
        { status: 400 }
      );
    }

    // Telefon numarasi validasyonu (opsiyonel ama girilmisse dogru formatta olmali)
    let phone: string | null = null;
    if (body.phone && body.phone.trim().length > 0) {
      const digits = body.phone.replace(/\D/g, '');
      if (digits.length !== 10 || !digits.startsWith('5')) {
        return NextResponse.json(
          { error: 'Gecersiz telefon numarasi (5XX XXX XX XX)' },
          { status: 400 }
        );
      }
      phone = digits;
    }

    // Kupon olustur
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

    // Kuponu kaydet
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code,
        expires_at: expiresAt.toISOString(),
        reference_id: 'survey',
      })
      .select()
      .single();

    if (couponError || !coupon) {
      console.error('Coupon create error:', couponError);
      return NextResponse.json(
        { error: 'Kupon olusturulamadi' },
        { status: 500 }
      );
    }

    // Anket yanitini kaydet
    const { error: surveyError } = await supabase
      .from('survey_responses')
      .insert({
        service_rating: body.service_rating,
        liked_drinks: body.liked_drinks,
        suggestions: body.suggestions.trim(),
        phone,
        coupon_id: coupon.id,
      });

    if (surveyError) {
      console.error('Survey save error:', surveyError);
      // Kupon zaten olusturuldu, devam et
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
    console.error('Survey submit error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatasi' },
      { status: 500 }
    );
  }
}
