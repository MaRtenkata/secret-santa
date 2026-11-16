# 🎅 Secret Santa

A small festive Secret Santa app for friends and family.

1. The organiser logs in and creates an event with everyone's name and email.
2. Names are drawn into one random gift circle (nobody draws themselves).
3. Everyone gets an email with a private link. The email does **not** say who they drew.
4. On their page, each person writes a wishlist of 3 items (a link, a description, or both).
5. Once their wishlist is saved, they see who they're buying for and that person's wishlist.

The organiser can see who has finished their wishlist, resend links and send reminders, but not who drew whom.

**Stack:** Next.js 16 (App Router, Server Actions) · Postgres on Neon · Drizzle ORM · Nodemailer + Gmail · Tailwind CSS 4. Hosted on Vercel's free tier from this GitHub repo.

## Setup

### 1. Gmail App Password

The app sends email through a Gmail account.

1. Turn on 2-Step Verification for the Google account: <https://myaccount.google.com/security>
2. Create an App Password: <https://myaccount.google.com/apppasswords> (name it "Secret Santa").
3. Use the account address as `GMAIL_USER` and the 16-character password as `GMAIL_APP_PASSWORD`.

Gmail allows roughly 500 emails a day, far more than you need.

### 2. Push to GitHub

```bash
git remote add origin git@github.com:<your-user>/secret-santa.git
git push -u origin main
```

### 3. Deploy on Vercel

1. On <https://vercel.com/new>, import the GitHub repo. Keep the defaults.
2. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it. This adds `DATABASE_URL`.
3. In **Settings → Environment Variables** add `ADMIN_PASSWORD`, `SESSION_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` and `APP_URL` (your `https://….vercel.app` address). See [.env.example](.env.example).
4. Redeploy so the new variables are picked up.

### 4. Create the database tables

From your machine, with `DATABASE_URL` in `.env.local` (copy it from Vercel → Storage → Neon → `.env.local` tab):

```bash
npm install
npm run db:push
```

Run `npm run db:push` again whenever `src/db/schema.ts` changes.

### 5. Use it

Open `https://<your-app>.vercel.app/admin`, log in with `ADMIN_PASSWORD`, and create your event.

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run db:push
npm run dev                  # http://localhost:3000
```

Tip for testing emails: Gmail ignores anything after a `+`, so `you+anna@gmail.com`, `you+ben@gmail.com` and `you+cleo@gmail.com` all land in your own inbox.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Run the name-draw tests |
| `npm run lint` | Lint |
| `npm run db:push` | Create/update database tables |
| `npm run db:studio` | Browse the database in your browser |

## How it works

- `src/lib/draw.ts` shuffles everyone and links them in a circle: each person gives to the next.
- `src/app/admin/actions.ts` creates the event, draws names, saves everything in one batch and sends the emails.
- `src/app/p/[token]/page.tsx` is each person's page. The giftee is only loaded from the database after the person's 3 wishes are saved, so it can't be found in the page source early.
- `src/proxy.ts` and `requireAdmin()` protect `/admin` with a signed cookie.
- Participant links use a random 32-character token and are the only way in, so ask people not to forward their email.
