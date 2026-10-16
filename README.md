# Rahat's Learning Nest 🪺

One place for Rahat to save his learning links: websites and videos for Math, English, Bangla, Science, Coding, General knowledge and more.

- Save a link with a title, subject and a short note
- Filter by subject, search, and mark links as **✓ Learned**
- Links are saved online (Supabase), so they show on every phone and computer
- Works on mobile, with light and dark mode

Built with Next.js, Tailwind CSS and Supabase.

## Run it on your computer

1. Copy `.env.example` to `.env.local` and fill in the two values (see below).
2. Run:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000

## Environment variables

| Name | Where to find it |
| --- | --- |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Project Settings → API Keys → Publishable key (`sb_publishable_...`) |

These are only used on the server (in `src/app/api`), never sent to the browser.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Under **Environment Variables**, add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
4. Click **Deploy**.

## Database

The `links` table lives in the Supabase project **rahats-learning-nest**. The SQL that created it (with the 5 starter links) is in
`supabase/migrations/`. To set up a fresh Supabase project, paste that file into Supabase → SQL Editor and click **Run**.

There is no login: anyone with the website link can add, mark and remove links. The database only allows these actions. It
checks that every link starts with `http://` or `https://` and that each subject is one of the 7 subjects.
