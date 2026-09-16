-- v1：帳號 + 學習進度跨裝置同步
--
-- 設計決定（見 docs/requirements.md）：
--   * 一課一列，不用 JSON blob。兩台裝置同時改不會互相蓋掉，
--     而且 updated_at 正好就是之後做連續學習天數要用的時間戳。
--   * is_done 保留為欄位而非刪除列。因為「取消已學會」必須能同步，
--     刪除列的話另一台裝置的舊資料會把它復活。
--   * lesson_key 是純文字（格式 'graph/bfs'），不設外鍵。
--     課程定義活在程式碼裡（src/lib/topics.ts），DB 不該是它的真相來源。

create table if not exists public.progress (
  user_id    uuid        not null references auth.users on delete cascade,
  lesson_key text        not null,
  is_done    boolean     not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

-- 側欄與路線圖都要「一次拿到這個人的全部進度」，不是每頁查一筆
create index if not exists progress_user_idx on public.progress (user_id);

alter table public.progress enable row level security;

-- 每個人只碰得到自己的列。四種操作各寫一條，不要用 for all，
-- 這樣之後要單獨收緊某一種操作時不必重寫。
create policy "progress: select own" on public.progress
  for select using (auth.uid() = user_id);

create policy "progress: insert own" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "progress: update own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress: delete own" on public.progress
  for delete using (auth.uid() = user_id);

-- 讓 updated_at 由資料庫決定，不信任前端送來的時間。
-- 跨裝置的 last-write-wins 靠這個欄位裁決，前端可竄改就沒有意義。
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before insert or update on public.progress
  for each row execute function public.touch_updated_at();
