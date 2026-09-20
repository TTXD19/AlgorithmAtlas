-- v2：收藏與筆記（docs/requirements.md R4a / R4b）
--
-- bookmarks 跟 progress 完全同形：一課一列、保留列、布林欄位 + updated_at，
-- 理由相同——「取消收藏」必須能跨裝置同步，刪除列會被另一台裝置的舊資料復活。
--
-- notes 一課一份純文字，主鍵 (user_id, lesson_key)，後寫的贏；「刪除筆記」是把
-- body 清成空字串而不是刪列，理由同上。updated_at 一樣由 trigger 決定，
-- 前端只拿它跟本機時間比大小。
--
-- 共用資料庫期間 migration 只做新增（見 requirements.md Q6）。

create table if not exists public.bookmarks (
  user_id    uuid        not null references auth.users on delete cascade,
  lesson_key text        not null,
  is_on      boolean     not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id);

alter table public.bookmarks enable row level security;

create policy "bookmarks: select own" on public.bookmarks
  for select using (auth.uid() = user_id);
create policy "bookmarks: insert own" on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy "bookmarks: update own" on public.bookmarks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bookmarks: delete own" on public.bookmarks
  for delete using (auth.uid() = user_id);

drop trigger if exists bookmarks_touch_updated_at on public.bookmarks;
create trigger bookmarks_touch_updated_at
  before insert or update on public.bookmarks
  for each row execute function public.touch_updated_at();


create table if not exists public.notes (
  user_id    uuid        not null references auth.users on delete cascade,
  lesson_key text        not null,
  body       text        not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key),
  -- 一篇筆記上限 20k 字元：這是課後筆記不是文件，也防止單列被塞爆
  constraint notes_body_len check (char_length(body) <= 20000)
);

create index if not exists notes_user_idx on public.notes (user_id);

alter table public.notes enable row level security;

create policy "notes: select own" on public.notes
  for select using (auth.uid() = user_id);
create policy "notes: insert own" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "notes: update own" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: delete own" on public.notes
  for delete using (auth.uid() = user_id);

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
  before insert or update on public.notes
  for each row execute function public.touch_updated_at();
