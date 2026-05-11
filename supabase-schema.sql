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

-- ─── KOKURIKULUM — PROFIL MURID ─────────────────────────
drop table if exists public.koku_profil_murid cascade;
create table public.koku_profil_murid (
  id               uuid primary key default gen_random_uuid(),
  no_daftar        text,
  nama             text not null,
  kelas            text,
  tahun            text default '2025',
  kelab            text,
  jawatan_kelab    text default 'Ahli Biasa',
  m_kelab          int  default 5 check (m_kelab between 0 and 10),
  uniform          text,
  pangkat_uniform  text default 'Ahli',
  m_uniform        int  default 5 check (m_uniform between 0 and 10),
  sukan            text,
  jawatan_sukan    text default 'Ahli',
  m_sukan          int  default 5 check (m_sukan between 0 and 10),
  catatan          text,
  status           text default 'Aktif',
  created_at       timestamptz default now()
);
alter table public.koku_profil_murid enable row level security;
create policy "anon full access" on public.koku_profil_murid for all to anon using (true) with check (true);

-- ─── BANTUAN PELAJARAN (Full System) ───────────────────
drop table if exists public.bantuan_rmt cascade;
drop table if exists public.bantuan_permohonan cascade;
drop table if exists public.bantuan_jenis cascade;
drop table if exists public.bantuan_murid cascade;

create table public.bantuan_murid (
  id               uuid primary key default gen_random_uuid(),
  no_daftar        text not null,
  nama             text not null,
  no_ic            text,
  kelas            text,
  jantina          text default 'L',
  tarikh_lahir     text,
  nama_waris       text,
  no_tel           text,
  pekerjaan_waris  text,
  pendapatan       numeric(10,2) default 0,
  kategori         text default 'T20',
  sumber           text,
  status           text default 'Aktif',
  created_at       timestamptz default now()
);
alter table public.bantuan_murid enable row level security;
create policy "anon full access" on public.bantuan_murid for all to anon using (true) with check (true);

create table public.bantuan_jenis (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  jenis       text default 'Wang',
  jumlah_max  numeric(10,2) default 0,
  sumber      text,
  status      text default 'Aktif',
  catatan     text,
  created_at  timestamptz default now()
);
alter table public.bantuan_jenis enable row level security;
create policy "anon full access" on public.bantuan_jenis for all to anon using (true) with check (true);

insert into public.bantuan_jenis (nama, jenis, jumlah_max, sumber, catatan) values
  ('Rancangan Makanan Tambahan (RMT)', 'Makanan', 0,   'KPM',    'Makanan tambahan harian'),
  ('Bantuan Am Persekolahan (BAP)',    'Wang',    150,  'KPM',    'Bantuan pakaian & kelengkapan sekolah'),
  ('KWAPM',                            'Wang',    500,  'Sekolah','Kumpulan Wang Amanah Pelajar Miskin'),
  ('Bantuan Zakat Pendidikan',         'Wang',    300,  'Zakat',  'Daripada badan zakat negeri'),
  ('Bantuan Kecemasan',                'Wang',    200,  'PIBG',   'Kes kecemasan / bencana'),
  ('Skim Baucar Tuisyen (SBT)',        'Baucar',  480,  'KPM',    'Baucar tuisyen 3 mata pelajaran');

create table public.bantuan_permohonan (
  id            uuid primary key default gen_random_uuid(),
  id_murid      uuid references public.bantuan_murid(id) on delete set null,
  no_daftar     text,
  nama_murid    text not null,
  kelas         text,
  jenis_id      uuid references public.bantuan_jenis(id) on delete set null,
  nama_bantuan  text,
  tahun         text,
  tarikh_mohon  text,
  tarikh_lulus  text,
  jumlah        numeric(10,2) default 0,
  status        text default 'Mohon',
  catatan       text,
  created_at    timestamptz default now()
);
alter table public.bantuan_permohonan enable row level security;
create policy "anon full access" on public.bantuan_permohonan for all to anon using (true) with check (true);

create table public.bantuan_rmt (
  id          uuid primary key default gen_random_uuid(),
  tahun       text,
  id_murid    uuid references public.bantuan_murid(id) on delete set null,
  no_daftar   text,
  nama_murid  text not null,
  kelas       text,
  status      text default 'Aktif',
  catatan     text,
  created_at  timestamptz default now()
);
alter table public.bantuan_rmt enable row level security;
create policy "anon full access" on public.bantuan_rmt for all to anon using (true) with check (true);

-- ─── KOKURIKULUM — KELAB & PERSATUAN ───────────────────
drop table if exists public.koku_kelab_pajsk cascade;
drop table if exists public.koku_kelab_perjumpaan cascade;
drop table if exists public.koku_kelab_ahli cascade;
drop table if exists public.koku_kelab cascade;

create table public.koku_kelab (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  kategori    text default 'Akademik',
  penasihat   text,
  sesi        text default '2025',
  sesi_min    int  default 8,
  status      text default 'Aktif',
  created_at  timestamptz default now()
);
alter table public.koku_kelab enable row level security;
create policy "anon full access" on public.koku_kelab for all to anon using (true) with check (true);

create table public.koku_kelab_ahli (
  id          uuid primary key default gen_random_uuid(),
  kelab_id    uuid references public.koku_kelab(id) on delete cascade,
  nama_kelab  text,
  no_daftar   text,
  nama        text not null,
  kelas       text,
  jawatan     text default 'Ahli Biasa',
  status      text default 'Aktif',
  created_at  timestamptz default now()
);
alter table public.koku_kelab_ahli enable row level security;
create policy "anon full access" on public.koku_kelab_ahli for all to anon using (true) with check (true);

create table public.koku_kelab_perjumpaan (
  id          uuid primary key default gen_random_uuid(),
  kelab_id    uuid references public.koku_kelab(id) on delete cascade,
  nama_kelab  text,
  tarikh      text not null,
  masa        text,
  lokasi      text,
  aktiviti    text,
  hadir       int  default 0,
  catatan     text,
  created_at  timestamptz default now()
);
alter table public.koku_kelab_perjumpaan enable row level security;
create policy "anon full access" on public.koku_kelab_perjumpaan for all to anon using (true) with check (true);

create table public.koku_kelab_pajsk (
  id          uuid primary key default gen_random_uuid(),
  kelab_id    uuid references public.koku_kelab(id) on delete cascade,
  ahli_id     uuid references public.koku_kelab_ahli(id) on delete cascade,
  nama_kelab  text,
  nama        text not null,
  kelas       text,
  jawatan     text default 'Ahli Biasa',
  kehadiran   int  default 0,
  peringkat   text default 'Tiada',
  pencapaian  text default 'Tiada',
  komitmen    int  default 1,
  khidmat     text default 'Ahli Biasa',
  tahun       text default '2025',
  created_at  timestamptz default now()
);
alter table public.koku_kelab_pajsk enable row level security;
create policy "anon full access" on public.koku_kelab_pajsk for all to anon using (true) with check (true);

-- ─── KOKURIKULUM — BADAN BERUNIFORM ────────────────────
drop table if exists public.koku_uniform_pajsk cascade;
drop table if exists public.koku_uniform_latihan cascade;
drop table if exists public.koku_uniform_ahli cascade;
drop table if exists public.koku_uniform cascade;

create table public.koku_uniform (
  id               uuid primary key default gen_random_uuid(),
  nama             text not null,
  jenis            text default 'Pengakap',
  guru_penasihat   text,
  guru_penasihat_2 text,
  hari             text default 'Rabu',
  masa             text default '2:00 PM',
  lokasi           text,
  min_latihan      int  default 10,
  tahun            text default '2025',
  status           text default 'Aktif',
  created_at       timestamptz default now()
);
alter table public.koku_uniform enable row level security;
create policy "anon full access" on public.koku_uniform for all to anon using (true) with check (true);

create table public.koku_uniform_ahli (
  id          uuid primary key default gen_random_uuid(),
  uniform_id  uuid references public.koku_uniform(id) on delete cascade,
  no_daftar   text,
  nama_murid  text not null,
  kelas       text,
  pangkat     text default 'Ahli Biasa',
  tahun       text default '2025',
  status      text default 'Aktif',
  created_at  timestamptz default now()
);
alter table public.koku_uniform_ahli enable row level security;
create policy "anon full access" on public.koku_uniform_ahli for all to anon using (true) with check (true);

create table public.koku_uniform_latihan (
  id          uuid primary key default gen_random_uuid(),
  uniform_id  uuid references public.koku_uniform(id) on delete cascade,
  tarikh      text not null,
  masa_mula   text,
  masa_tamat  text,
  aktiviti    text,
  lokasi      text,
  hadir       int  default 0,
  guru_hadir  text,
  catatan     text,
  created_at  timestamptz default now()
);
alter table public.koku_uniform_latihan enable row level security;
create policy "anon full access" on public.koku_uniform_latihan for all to anon using (true) with check (true);

create table public.koku_uniform_pajsk (
  id               uuid primary key default gen_random_uuid(),
  uniform_id       uuid references public.koku_uniform(id) on delete cascade,
  ahli_id          uuid references public.koku_uniform_ahli(id) on delete cascade,
  nama_murid       text not null,
  kelas            text,
  pangkat          text default 'Ahli Biasa',
  kehadiran_hadir  int  default 0,
  kehadiran_total  int  default 10,
  peringkat        text default 'Tiada',
  pencapaian       text default 'Tiada',
  komitmen         int  default 2,
  khidmat          text default 'Ahli Biasa',
  tahun            text default '2025',
  created_at       timestamptz default now()
);
alter table public.koku_uniform_pajsk enable row level security;
create policy "anon full access" on public.koku_uniform_pajsk for all to anon using (true) with check (true);

-- ─── 16. NOTIS & KEMASKINI ──────────────────────────────
drop table if exists public.notis cascade;
create table public.notis (
  id         uuid primary key default gen_random_uuid(),
  icon       text default '📌',
  teks       text not null,
  tag        text default 'Maklumat',
  tc         text default '#6366f1',
  bg         text default '#f0f0ff',
  created_at timestamptz default now()
);
alter table public.notis enable row level security;
create policy "anon full access" on public.notis for all to anon using (true) with check (true);
