# Cafe Kupon Sistemi

Google Forms anketini tamamlayan musteriler icin tek kullanimlik QR indirim kuponu olusturan Next.js web uygulamasi.

## Ozellikler

- **Kupon Olusturma** (`/generate`): Anket sonrasi 6 saat gecerli QR kupon olusturur
- **Kupon Dogrulama** (`/verify`): Personel icin QR tarama veya manuel kod girisi
- **Yonetim Paneli** (`/admin`): Istatistikler ve kupon listesi

## Teknolojiler

- Next.js 14 (App Router)
- Supabase (veritabani)
- TypeScript
- Tailwind CSS
- qrcode (QR kod olusturma)
- html5-qrcode (QR kod tarama)

## Kurulum

### 1. Bagimliliklari Yukleyin

```bash
npm install
```

### 2. Supabase Kurulumu

1. [Supabase](https://supabase.com) uzerinde yeni bir proje olusturun
2. SQL Editor'e gidin ve `supabase/schema.sql` icerigini calistirin:

```sql
-- Kuponlar tablosu
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  source_timestamp TEXT,
  reference_id TEXT
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON coupons FOR UPDATE USING (true) WITH CHECK (true);
```

### 3. Ortam Degiskenlerini Ayarlayin

`.env.local.example` dosyasini `.env.local` olarak kopyalayin:

```bash
cp .env.local.example .env.local
```

Degerleri doldurun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Supabase bilgilerinizi Settings > API bolumundan bulabilirsiniz.

### 4. Gelistirme Sunucusunu Baslatin

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde calisacak.

## Kullanim

### Google Forms Entegrasyonu

1. Google Forms'da bir anket olusturun
2. Anket tamamlandiktan sonra yonlendirecek URL'i ayarlayin:
   ```
   https://your-domain.com/generate?timestamp={timestamp}&ref={responseId}
   ```
3. (Opsiyonel) Query parametreleri:
   - `timestamp`: Form gonderim zamani
   - `ref`: Referans ID

### Personel Girisi

Dogrulama (`/verify`) ve Yonetim (`/admin`) sayfalari sifre korumalidur.

**Varsayilan sifre:** `cafe2024`

> Uretim ortami icin `src/lib/utils.ts` dosyasindaki `STAFF_PASSWORD` sabitini degistirin.

## Sayfalar

| Sayfa | URL | Aciklama |
|-------|-----|----------|
| Ana Sayfa | `/` | `/generate` sayfasina yonlendirir |
| Kupon Olustur | `/generate` | Musteri icin QR kupon olusturur |
| Kupon Dogrula | `/verify` | Personel icin kupon dogrulama |
| Yonetim | `/admin` | Istatistikler ve kupon listesi |

## API Endpoints

### POST `/api/coupons/generate`
Yeni kupon olusturur.

**Request Body:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "ref": "optional-reference-id"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": "uuid",
    "code": "ABCD1234",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-15T16:30:00Z"
  }
}
```

### POST `/api/coupons/verify`
Kuponu dogrular ve kullanildi olarak isaretler.

**Request Body:**
```json
{
  "code": "ABCD1234"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Kupon gecerli! Indirim uygulanabilir.",
  "status": "valid",
  "coupon": {
    "code": "ABCD1234",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-15T16:30:00Z"
  }
}
```

### GET `/api/coupons/stats`
Kupon istatistiklerini getirir (sifre korumaali).

**Headers:**
```
x-admin-password: cafe2024
```

**Response:**
```json
{
  "stats": {
    "total": 100,
    "used": 45,
    "expired": 30,
    "active": 25
  },
  "coupons": [...]
}
```

## Vercel'e Deploy

1. GitHub'a push edin
2. [Vercel](https://vercel.com) uzerinde projeyi import edin
3. Ortam degiskenlerini ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (Vercel domain'iniz)
4. Deploy!

## Proje Yapisi

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Ana sayfa (redirect)
│   ├── generate/page.tsx   # Kupon olusturma
│   ├── verify/page.tsx     # Kupon dogrulama
│   ├── admin/page.tsx      # Yonetim paneli
│   └── api/coupons/        # API routes
├── components/
│   ├── QRCodeDisplay.tsx   # QR kod gosterimi
│   ├── QRScanner.tsx       # QR kod tarama
│   ├── CountdownTimer.tsx  # Geri sayim
│   └── PasswordGate.tsx    # Sifre korumasi
└── lib/
    ├── supabase.ts         # Supabase client
    └── utils.ts            # Yardimci fonksiyonlar
```

## Lisans

MIT
