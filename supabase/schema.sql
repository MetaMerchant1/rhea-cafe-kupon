-- Cafe Kupon Sistemi - Supabase Database Schema
-- Bu dosyayi Supabase SQL Editor'de calistirin

-- Kuponlar tablosu
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  source_timestamp TEXT,  -- Google Forms'dan gelen timestamp
  reference_id TEXT       -- Opsiyonel referans ID
);

-- Hizli arama icin indexler
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- Row Level Security aktif et
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Anonim erisim icin policy (anon key kullandigimiz icin)
-- Production'da daha katı kurallar uygulanabilir
CREATE POLICY "Allow anonymous read" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON coupons
  FOR UPDATE USING (true) WITH CHECK (true);

-- Istatistikler icin view (opsiyonel)
CREATE OR REPLACE VIEW coupon_stats AS
SELECT
  COUNT(*) as total_coupons,
  COUNT(*) FILTER (WHERE is_used = true) as used_coupons,
  COUNT(*) FILTER (WHERE is_used = false AND expires_at > NOW()) as active_coupons,
  COUNT(*) FILTER (WHERE is_used = false AND expires_at <= NOW()) as expired_coupons
FROM coupons;

-- =====================================================
-- ANKET YANITLARI TABLOSU
-- =====================================================

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_rating INTEGER NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
  liked_drinks BOOLEAN NOT NULL,
  suggestions TEXT NOT NULL,
  phone TEXT,  -- Opsiyonel
  coupon_id UUID REFERENCES coupons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at DESC);

-- RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert survey_responses" ON survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select survey_responses" ON survey_responses
  FOR SELECT USING (true);
