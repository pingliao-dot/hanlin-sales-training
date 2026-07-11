-- =========================================================
-- 翰林業務教育訓練平台 · 進度資料表
-- 在 Supabase 後台的 SQL Editor 貼上並執行一次即可。
-- =========================================================

create table if not exists public.progress_log (
  id           bigint generated always as identity primary key,
  usermail     text not null,          -- 使用者 email
  project      text not null,          -- 專案別（例：命題大師）
  step         text not null,          -- 任務步驟（例：命題大師介紹）
  completed_at timestamptz not null default now(),  -- 完成時間
  unique (usermail, project, step)
);

-- 開啟資料列權限控管（RLS）
alter table public.progress_log enable row level security;

-- =========================================================
-- 管理者白名單（只有名單內的人能看後台全部資料）
-- =========================================================
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;  -- 不開任何政策 = 一般使用者無法透過 API 讀寫，只能在後台管理

-- ★★ 把下面這行的 email 換成「你的 @hanlin.com.tw 信箱」，再執行 ★★
insert into public.admins (email) values ('請改成你的email@hanlin.com.tw')
  on conflict (email) do nothing;

-- 判斷目前登入者是不是管理者（security definer 讓它能查 admins 表）
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email');
$$;
grant execute on function public.is_admin() to authenticated;

-- 讀取：自己的，或（管理者）全部
drop policy if exists "read own" on public.progress_log;
drop policy if exists "read own or admin" on public.progress_log;
create policy "read own or admin" on public.progress_log
  for select to authenticated
  using ( usermail = auth.jwt() ->> 'email' or public.is_admin() );

-- 只能新增自己的、且必須是公司網域
drop policy if exists "insert own" on public.progress_log;
create policy "insert own" on public.progress_log
  for insert to authenticated
  with check ( usermail = auth.jwt() ->> 'email'
               and usermail like '%@hanlin.com.tw' );

-- upsert 需要 update 權限（一樣只能改自己的）
drop policy if exists "update own" on public.progress_log;
create policy "update own" on public.progress_log
  for update to authenticated
  using ( usermail = auth.jwt() ->> 'email' )
  with check ( usermail = auth.jwt() ->> 'email' );

-- 只能刪自己的（重設進度用）
drop policy if exists "delete own" on public.progress_log;
create policy "delete own" on public.progress_log
  for delete to authenticated
  using ( usermail = auth.jwt() ->> 'email' );

-- 提醒：你（管理者）在 Supabase 後台的 Table Editor 直接看，
-- 會用 service role 權限、可看到全部人的紀錄，不受上面規則限制。
