-- =====================================================================
-- RUMAH KITA — penyiapan database bersama
-- Jalankan seluruh isi file ini di Supabase > SQL Editor > New query > Run
-- =====================================================================

-- 1. Tabel transaksi
create table if not exists public.transaksi (
  id        uuid primary key default gen_random_uuid(),
  jenis     text not null check (jenis in ('masuk','keluar')),
  kategori  text not null,
  nominal   bigint not null check (nominal > 0),
  tanggal   date not null,
  catatan   text default '',
  oleh      text default '',
  dibuat    timestamptz not null default now()
);

create index if not exists transaksi_tanggal_idx on public.transaksi (tanggal desc);

-- 2. Kunci akses: hanya akun yang sudah login boleh menyentuh data
alter table public.transaksi enable row level security;

drop policy if exists "penghuni boleh baca"    on public.transaksi;
drop policy if exists "penghuni boleh tambah"  on public.transaksi;
drop policy if exists "penghuni boleh ubah"    on public.transaksi;
drop policy if exists "penghuni boleh hapus"   on public.transaksi;

create policy "penghuni boleh baca"   on public.transaksi
  for select to authenticated using (true);
create policy "penghuni boleh tambah" on public.transaksi
  for insert to authenticated with check (true);
create policy "penghuni boleh ubah"   on public.transaksi
  for update to authenticated using (true) with check (true);
create policy "penghuni boleh hapus"  on public.transaksi
  for delete to authenticated using (true);

-- 3. Hidupkan realtime supaya perubahan langsung muncul di layar pasangan
alter publication supabase_realtime add table public.transaksi;
