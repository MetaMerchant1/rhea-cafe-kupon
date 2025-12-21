import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Rastgele token olustur
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Token olustur
export async function POST() {
  try {
    let token: string;
    let attempts = 0;

    // Benzersiz token olustur
    do {
      token = generateToken();
      const { data: existing } = await supabase
        .from('survey_tokens')
        .select('id')
        .eq('token', token)
        .single();

      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    // Token'i kaydet (30 dakika gecerli)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const { error } = await supabase
      .from('survey_tokens')
      .insert({
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Token create error:', error);
      return NextResponse.json({ error: 'Token olusturulamadi' }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Survey token error:', error);
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
  }
}

// Token dogrula (sadece kontrol, kullanildi olarak isaretleme)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const markAsUsed = request.nextUrl.searchParams.get('mark') === 'true';

    if (!token) {
      return NextResponse.json({ valid: false, message: 'Token gerekli' });
    }

    const { data: tokenData, error } = await supabase
      .from('survey_tokens')
      .select('*')
      .eq('token', token.toUpperCase())
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ valid: false, message: 'Gecersiz token' });
    }

    // Suresi dolmus mu?
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Token suresi dolmus' });
    }

    // Zaten kullanilmis mi?
    if (tokenData.is_used) {
      return NextResponse.json({ valid: false, message: 'Token zaten kullanilmis' });
    }

    // Sadece mark=true ise kullanildi olarak isaretle
    if (markAsUsed) {
      await supabase
        .from('survey_tokens')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);
    }

    return NextResponse.json({ valid: true, tokenId: tokenData.id });
  } catch (error) {
    console.error('Token validate error:', error);
    return NextResponse.json({ valid: false, message: 'Sunucu hatasi' });
  }
}
