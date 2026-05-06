-- ═══════════════════════════════════════════════════════
--  SK DARAU DASHBOARD — Database Schema (v3)
--  Run this in Supabase SQL Editor
--  Safe to re-run: drops existing tables first
-- ═══════════════════════════════════════════════════════

-- Drop all existing tables (clean slate)
drop table if exists public.perkembangan_staf cascade;
drop table if exists public.nilam cascade;
drop table if exists public.program_akademik cascade;
drop table if exists public.rph cascade;
drop table if exists public.peperiksaan cascade;
drop table if exists public.panitia cascade;
drop table if exists public.jadual_waktu cascade;
-- HEM tables
drop table if exists public.hem_murid cascade;
drop table if exists public.hem_disiplin cascade;
drop table if exists public.hem_kaunseling cascade;
drop table if exists public.hem_kesihatan cascade;
drop table if exists public.hem_bantuan cascade;
drop table if exists public.hem_3k cascade;
drop table if exists public.hem_pengawas cascade;
drop table if exists public.hem_koperasi cascade;

-- ─── 1. JADUAL WAKTU ────────────────────────────────────
create table public.jadual_waktu (
  id          uuid primary key default gen_random_uuid(),
  kelas       text not null,
  hari        text not null,
  waktu_slot  int  not null,
  subjek      text not null,
  guru        text not null,
  created_at  timestamptz default now()
);
alter table public.jadual_waktu enable row level security;
create policy "anon full access" on public.jadual_waktu for all to anon using (true) with check (true);

-- ─── 2. PANITIA ─────────────────────────────────────────
create table public.panitia (
  id                uuid primary key default gen_random_uuid(),
  subjek            text not null,
  icon              text default '📋',
  color             text default '#2563eb',
  bg                text default '#eff6ff',
  ketua             text,
  jumlah_ahli       int  default 0,
  tarikh_mesyuarat  text,
  status            text default 'Aktif',
  created_at        timestamptz default now()
);
alter table public.panitia enable row level security;
create policy "anon full access" on public.panitia for all to anon using (true) with check (true);

-- ─── 3. PEPERIKSAAN ─────────────────────────────────────
create table public.peperiksaan (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  tarikh      text,
  kelas       text default 'Tahun 1–6',
  status      text default 'Akan Datang',
  created_at  timestamptz default now()
);
alter table public.peperiksaan enable row level security;
create policy "anon full access" on public.peperiksaan for all to anon using (true) with check (true);

-- ─── 4. RPH / REKOD MENGAJAR ────────────────────────────
create table public.rph (
  id          uuid primary key default gen_random_uuid(),
  guru        text not null,
  subjek      text,
  kelas       text,
  minggu      text,
  status      text default 'Tertunggak',
  created_at  timestamptz default now()
);
alter table public.rph enable row level security;
create policy "anon full access" on public.rph for all to anon using (true) with check (true);

-- ─── 5. PROGRAM AKADEMIK ────────────────────────────────
create table public.program_akademik (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  tarikh      text,
  deskripsi   text,
  color       text default '#2563eb',
  status      text default 'Akan Datang',
  created_at  timestamptz default now()
);
alter table public.program_akademik enable row level security;
create policy "anon full access" on public.program_akademik for all to anon using (true) with check (true);

-- ─── 6. PUSAT SUMBER / NILAM ────────────────────────────
create table public.nilam (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  kelas        text,
  buku_dibaca  int  default 0,
  sasaran      int  default 8,
  created_at   timestamptz default now()
);
alter table public.nilam enable row level security;
create policy "anon full access" on public.nilam for all to anon using (true) with check (true);

-- ─── 7. PERKEMBANGAN STAF ───────────────────────────────
create table public.perkembangan_staf (
  id          uuid primary key default gen_random_uuid(),
  peserta     text not null,
  kursus      text,
  tarikh      text,
  penganjur   text,
  status      text default 'Akan Datang',
  created_at  timestamptz default now()
);
alter table public.perkembangan_staf enable row level security;
create policy "anon full access" on public.perkembangan_staf for all to anon using (true) with check (true);

-- ─── 8. HEM — MURID (APDM) ─────────────────────────────
create table public.hem_murid (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  kelas         text,
  ic            text,
  jantina       text default 'Lelaki',
  telefon_wali  text,
  status        text default 'Aktif',
  created_at    timestamptz default now()
);
alter table public.hem_murid enable row level security;
create policy "anon full access" on public.hem_murid for all to anon using (true) with check (true);
insert into public.hem_murid (nama, kelas, ic, jantina, telefon_wali, status) values
  ('Ahmad Faris bin Rahim',   'Tahun 4 Angsana', '120304-12-0011', 'Lelaki',    '011-2345678', 'Aktif'),
  ('Nurul Aina binti Salleh', 'Tahun 5 Seroja',  '110505-12-0022', 'Perempuan', '012-3456789', 'Aktif'),
  ('Haziq bin Zulkifli',      'Tahun 6 Emas',    '100606-12-0033', 'Lelaki',    '013-4567890', 'Aktif');

-- ─── 9. HEM — DISIPLIN ──────────────────────────────────
create table public.hem_disiplin (
  id          uuid primary key default gen_random_uuid(),
  nama_murid  text not null,
  kelas       text,
  tarikh      text,
  kesalahan   text,
  tindakan    text,
  status      text default 'Dalam Proses',
  created_at  timestamptz default now()
);
alter table public.hem_disiplin enable row level security;
create policy "anon full access" on public.hem_disiplin for all to anon using (true) with check (true);
insert into public.hem_disiplin (nama_murid, kelas, tarikh, kesalahan, tindakan, status) values
  ('Ahmad Faris bin Rahim',   'Tahun 4 Angsana', '02 Mei 2025', 'Ponteng kelas',   'Surat amaran dikeluarkan', 'Selesai'),
  ('Haziq bin Zulkifli',      'Tahun 6 Emas',    '05 Mei 2025', 'Bergaduh',        'Panggil wali murid',       'Dalam Proses');

-- ─── 10. HEM — KAUNSELING ───────────────────────────────
create table public.hem_kaunseling (
  id          uuid primary key default gen_random_uuid(),
  nama_murid  text not null,
  kelas       text,
  tarikh      text,
  jenis_kes   text,
  kaunselor   text,
  status      text default 'Dalam Proses',
  created_at  timestamptz default now()
);
alter table public.hem_kaunseling enable row level security;
create policy "anon full access" on public.hem_kaunseling for all to anon using (true) with check (true);
insert into public.hem_kaunseling (nama_murid, kelas, tarikh, jenis_kes, kaunselor, status) values
  ('Nurul Aina binti Salleh', 'Tahun 5 Seroja', '08 Mei 2025', 'Masalah Akademik', 'Pn. Salmah',   'Selesai'),
  ('Ahmad Faris bin Rahim',   'Tahun 4 Angsana','10 Mei 2025', 'Masalah Peribadi', 'Pn. Salmah',   'Dalam Proses');

-- ─── 11. HEM — KESIHATAN ────────────────────────────────
create table public.hem_kesihatan (
  id                  uuid primary key default gen_random_uuid(),
  nama_murid          text not null,
  kelas               text,
  tarikh              text,
  jenis_pemeriksaan   text,
  catatan             text,
  status              text default 'Normal',
  created_at          timestamptz default now()
);
alter table public.hem_kesihatan enable row level security;
create policy "anon full access" on public.hem_kesihatan for all to anon using (true) with check (true);
insert into public.hem_kesihatan (nama_murid, kelas, tarikh, jenis_pemeriksaan, catatan, status) values
  ('Ahmad Faris bin Rahim',   'Tahun 4 Angsana', '20 Apr 2025', 'Pemeriksaan Tahunan', 'Sihat', 'Normal'),
  ('Nurul Aina binti Salleh', 'Tahun 5 Seroja',  '20 Apr 2025', 'Pemeriksaan Gigi',    'Perlu rawatan', 'Perlu Perhatian'),
  ('Haziq bin Zulkifli',      'Tahun 6 Emas',    '20 Apr 2025', 'Pemeriksaan Mata',    'Silau ringan',  'Normal');

-- ─── 12. HEM — BANTUAN PELAJARAN ────────────────────────
create table public.hem_bantuan (
  id            uuid primary key default gen_random_uuid(),
  nama_murid    text not null,
  kelas         text,
  jenis_bantuan text,
  tahun         text default '2025',
  status        text default 'Aktif',
  created_at    timestamptz default now()
);
alter table public.hem_bantuan enable row level security;
create policy "anon full access" on public.hem_bantuan for all to anon using (true) with check (true);
insert into public.hem_bantuan (nama_murid, kelas, jenis_bantuan, tahun, status) values
  ('Ahmad Faris bin Rahim',   'Tahun 4 Angsana', 'Rancangan Makanan Tambahan (RMT)', '2025', 'Aktif'),
  ('Nurul Aina binti Salleh', 'Tahun 5 Seroja',  'Bantuan Awal Persekolahan (BAP)',  '2025', 'Aktif'),
  ('Haziq bin Zulkifli',      'Tahun 6 Emas',    'Kumpulan Wang Amanah Pelajar Miskin (KWAPM)', '2025', 'Aktif');

-- ─── 13. HEM — KESELAMATAN & 3K ─────────────────────────
create table public.hem_3k (
  id          uuid primary key default gen_random_uuid(),
  tajuk       text not null,
  tarikh      text,
  jenis       text,
  lokasi      text,
  status      text default 'Akan Datang',
  created_at  timestamptz default now()
);
alter table public.hem_3k enable row level security;
create policy "anon full access" on public.hem_3k for all to anon using (true) with check (true);
insert into public.hem_3k (tajuk, tarikh, jenis, lokasi, status) values
  ('Gotong-royong Bulanan',   '15 Mei 2025',  'Kebersihan', 'Padang sekolah',   'Akan Datang'),
  ('Kawad Kebakaran',         '22 Apr 2025',  'Keselamatan','Kawasan sekolah',  'Selesai'),
  ('Kempen Anti-Denggi',      '10 Apr 2025',  'Kesihatan',  'Kelas Tahun 4–6',  'Selesai');

-- ─── 14. HEM — PENGAWAS SEKOLAH ─────────────────────────
create table public.hem_pengawas (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  kelas        text,
  jawatan      text,
  tarikh_lantik text,
  status       text default 'Aktif',
  created_at   timestamptz default now()
);
alter table public.hem_pengawas enable row level security;
create policy "anon full access" on public.hem_pengawas for all to anon using (true) with check (true);
insert into public.hem_pengawas (nama, kelas, jawatan, tarikh_lantik, status) values
  ('Nurul Aina binti Salleh', 'Tahun 6 Emas',   'Ketua Pengawas',    '1 Jan 2025', 'Aktif'),
  ('Muhamad Ridhwan',         'Tahun 6 Emas',   'Penolong Ketua',    '1 Jan 2025', 'Aktif'),
  ('Siti Nurbaiti binti Amir','Tahun 5 Seroja',  'Pengawas Biasa',    '1 Jan 2025', 'Aktif');

-- ─── 15. HEM — KOPERASI ─────────────────────────────────
create table public.hem_koperasi (
  id           uuid primary key default gen_random_uuid(),
  nama_produk  text not null,
  kategori     text,
  stok         int  default 0,
  harga        numeric(8,2) default 0.00,
  status       text default 'Tersedia',
  created_at   timestamptz default now()
);
alter table public.hem_koperasi enable row level security;
create policy "anon full access" on public.hem_koperasi for all to anon using (true) with check (true);
insert into public.hem_koperasi (nama_produk, kategori, stok, harga, status) values
  ('Buku Tulis A4',    'Alat Tulis',  150, 1.50, 'Tersedia'),
  ('Pensel 2B',        'Alat Tulis',  200, 0.80, 'Tersedia'),
  ('Beg Sekolah Biru', 'Pakaian',     30,  25.00, 'Tersedia'),
  ('Topi Sekolah',     'Pakaian',     45,  8.00,  'Tersedia');
