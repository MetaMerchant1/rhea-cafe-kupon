import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCouponStatus } from '@/lib/supabase';
import { verifyPassword } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Sifre kontrolu (header'dan)
    const password = request.headers.get('x-admin-password');
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Yetkisiz erisim' },
        { status: 401 }
      );
    }

    // Tum kuponlari al
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Veriler alinirken hata olustu' },
        { status: 500 }
      );
    }

    const now = new Date();

    // Istatistikleri hesapla
    const stats = {
      total: coupons?.length || 0,
      used: 0,
      expired: 0,
      active: 0,
    };

    const processedCoupons = coupons?.map((coupon) => {
      const status = getCouponStatus(coupon);

      if (status === 'used') stats.used++;
      else if (status === 'expired') stats.expired++;
      else if (status === 'active') stats.active++;

      return {
        ...coupon,
        status,
      };
    }) || [];

    // Anket yanitlarini al
    const { data: surveyResponses, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*, coupons(code)')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      stats,
      coupons: processedCoupons.slice(0, 50), // Son 50 kupon
      surveyResponses: surveyError ? [] : surveyResponses || [],
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatasi' },
      { status: 500 }
    );
  }
}
