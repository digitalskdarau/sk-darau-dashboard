-- ═══════════════════════════════════════════════════════
--  SK DARAU DASHBOARD — Database Schema
--  Run this in Supabase SQL Editor (one time only)
-- ═══════════════════════════════════════════════════════

-- 1. JADUAL WAKTU
create table if not exists public.jadual_waktu (
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

-- 2. PANITIA
create table if not exists public.panitia (
  id                  uuid primary key default gen_random_uuid(),
  subjek              text not null,
  icon                text,
  ketua               text,
  jumlah_ahli         int,
  tarikh_mesyuarat    text,
  status              text,
  created_at          timestamptz default now()
);
alter table public.panitia enable row level security;
create policy "anon full access" on public.panitia for all to anon using (true) with check (true);

-- 3. PEPERIKSAAN
create table if not exists public.peperiksaan (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  tarikh      text,
  kelas       text,
  status      text,
  created_at  timestamptz default now()
);
alter table public.peperiksaan enable row level security;
create policy "anon full access" on public.peperiksaan for all to anon using (true) with check (true);

-- 4. RPH
create table if not exists public.rph (
  id          uuid primary key default gen_random_uuid(),
  guru        text not null,
  subjek      text,
  kelas       text,
  minggu      text,
  status      text,
  created_at  timestamptz default now()
);
alter table public.rph enable row level security;
create policy "anon full access" on public.rph for all to anon using (true) with check (true);

-- 5. PROGRAM AKADEMIK
create table if not exists public.program_akademik (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  tarikh      text,
  deskripsi   text,
  color       text,
  status      text,
  created_at  timestamptz default now()
);
alter table public.program_akademik enable row level security;
create policy "anon full access" on public.program_akademik for all to anon using (true) with check (true);

-- 6. NILAM
create table if not exists public.nilam (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  kelas         text,
  buku_dibaca   int default 0,
  sasaran       int default 0,
  created_at    timestamptz default now()
);
alter table public.nilam enable row level security;
create policy "anon full access" on public.nilam for all to anon using (true) with check (true);

-- 7. PERKEMBANGAN STAF
create table if not exists public.perkembangan_staf (
  id          uuid primary key default gen_random_uuid(),
  peserta     text not null,
  kursus      text,
  tarikh      text,
  penganjur   text,
  status      text,
  created_at  timestamptz default now()
);
alter table public.perkembangan_staf enable row level security;
create policy "anon full access" on public.perkembangan_staf for all to anon using (true) with check (true);
