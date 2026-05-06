-- ═══════════════════════════════════════════════════════
--  SK DARAU DASHBOARD — Database Schema (v2)
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
