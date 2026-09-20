-- 練習題完成紀錄（docs/requirements.md R4c）
--
-- 形狀與 progress 相同，只是 key 是題目來源（'LeetCode 50'）而不是課程：
-- 同一題在多篇課程出現，解過一次每篇都該打勾。

create table if not exists public.problems (
  user_id     uuid        not null references auth.users on delete cascade,
  problem_key text        not null,
  is_done     boolean     not null default true,
  updated_at  timestamptz not null default now(),
  primary key (user_id, problem_key)
);

create index if not exists problems_user_idx on public.problems (user_id);

alter table public.problems enable row level security;

create policy "problems: select own" on public.problems
  for select using (auth.uid() = user_id);
create policy "problems: insert own" on public.problems
  for insert with check (auth.uid() = user_id);
create policy "problems: update own" on public.problems
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "problems: delete own" on public.problems
  for delete using (auth.uid() = user_id);

drop trigger if exists problems_touch_updated_at on public.problems;
create trigger problems_touch_updated_at
  before insert or update on public.problems
  for each row execute function public.touch_updated_at();
