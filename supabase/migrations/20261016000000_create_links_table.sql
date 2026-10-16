-- Already applied to the Supabase project "rahats-learning-nest".
-- Kept here so the database can be recreated in a new project if ever needed
-- (paste it into Supabase -> SQL Editor and click Run).

create table public.links (
  id uuid primary key default gen_random_uuid(),
  url text not null check (url ~* '^https?://' and char_length(url) <= 2000),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  subject text not null check (subject in ('math','english','bangla','science','coding','gk','other')),
  note text check (note is null or char_length(note) <= 300),
  learned boolean not null default false,
  created_at timestamptz not null default now()
);

create index links_created_at_idx on public.links (created_at desc);

alter table public.links enable row level security;

-- The site is a shared family page with no login, so the anon role may
-- read, add, mark learned and remove links. Updates are limited to the
-- "learned" column by the column-level grant below.
revoke all on public.links from anon, authenticated;
grant select, insert, delete on public.links to anon;
grant update (learned) on public.links to anon;

create policy "Anyone can read links" on public.links for select to anon using (true);
create policy "Anyone can add links" on public.links for insert to anon with check (learned = false);
create policy "Anyone can mark links learned" on public.links for update to anon using (true) with check (true);
create policy "Anyone can remove links" on public.links for delete to anon using (true);

insert into public.links (url, title, subject, note, created_at) values
  ('https://scratch.mit.edu', 'Scratch, coding with games', 'coding', 'Make your own games and animations with blocks.', now() - interval '4 minutes'),
  ('https://10minuteschool.com', '10 Minute School (Bangla)', 'bangla', 'Lessons in Bangla for many subjects.', now() - interval '3 minutes'),
  ('https://www.bbc.co.uk/learningenglish', 'BBC Learning English', 'english', 'Short English lessons with videos.', now() - interval '2 minutes'),
  ('https://www.khanacademy.org/science', 'Khan Academy Science', 'science', 'Videos and practice for science.', now() - interval '1 minute'),
  ('https://www.khanacademy.org/math', 'Khan Academy Math', 'math', 'Practice math step by step.', now());
