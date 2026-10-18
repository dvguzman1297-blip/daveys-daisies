# Davey's Daisies

Arrange a digital bouquet, write a letter, and share it with a link.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Lucide · canvas-confetti · Supabase · Vercel

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase env vars, dev mode uses an **in-memory store**, so the whole flow works right away. Bouquets are lost when the server restarts. Production refuses to run without Supabase.

## Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migration in `supabase/migrations/20261018000000_create_bouquets.sql`. It creates the `daveys_daisies` schema and the `daveys_daisies.bouquets` table.
   - **Dashboard:** SQL Editor → paste the file → Run, or
   - **CLI:** `npx supabase link --project-ref <ref>` then `npx supabase db push`.
3. **Expose the schema:** go to Project Settings → Data API → **Exposed schemas**, add `daveys_daisies`, and save. Without this, queries fail with `Invalid schema: daveys_daisies`.
4. Copy `.env.example` to `.env.local` and fill in values from **Project Settings → API**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret; server-only)

### Security model

All tables live in the `daveys_daisies` schema, which is granted only to `service_role`. The anon and authenticated roles have no grants, and RLS is enabled with no policies as a second layer. All access goes through the Next.js server with the service-role key:

- Inserts happen in a Server Action (`src/app/actions.ts`) that re-validates every field.
- Reads fetch **one row by UUID** (`src/lib/bouquets.ts`).

The UUID acts as an unguessable link, and recipient pages are marked `noindex`.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables. `NEXT_PUBLIC_FACEBOOK_APP_ID` is optional; it enables the desktop Messenger dialog.
3. Deploy.

Before a public launch, add rate limiting to bouquet creation, for example a Vercel Firewall rule on `POST /create`.

## Project map

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Landing / hero |
| `src/app/create/page.tsx` | Builder route |
| `src/app/b/[id]/page.tsx` | Recipient view (server fetch + metadata) |
| `src/app/actions.ts` | `createBouquet` Server Action |
| `src/components/BouquetBuilder.tsx` | 3-step flow: flowers → letter → share |
| `src/components/BouquetCanvas.tsx` | SVG bouquet with spring/bloom animations and a drop target |
| `src/components/FlowerPicker.tsx` | Flower grid, counters, flower cap (`MAX_FLOWERS`), drag source |
| `src/components/PresetPicker.tsx` | Ready-made bouquets (defined in `src/lib/catalog.ts`) |
| `src/components/LetterForm.tsx` | Themed letter editor |
| `src/components/MusicPicker.tsx` | Background music choice with previews |
| `src/components/LetterMusic.tsx` | Recipient music: fade-in playback and the now-playing pill |
| `src/components/ShareModal.tsx` | Copy link, WhatsApp / X / Messenger, QR code, confetti |
| `src/components/RecipientView.tsx` | Bloom-in bouquet and envelope that opens |
| `src/lib/arrangement.ts` | Deterministic stem layout derived from flower counts |
| `src/lib/bouquets.ts` | Validation and data access (Supabase or dev memory store) |
| `src/types/bouquet.ts` | Shared TypeScript interfaces |

## Music credits

Background music lives in `public/music/`. Every recording is public domain or CC BY 3.0, sourced from Wikimedia Commons. Each track's credit is also shown in the player on the recipient page.

| Track | Credit | License |
|---|---|---|
| Clair de Lune (Debussy) | Wright Brass, U.S. Air Force Band of Flight | Public domain (U.S. government work) |
| Liebestraum No. 3 (Liszt) | Wilhelm Backhaus, recorded 1923 | Public domain |
| Canon in D (Pachelbel) | "Canon in D Major" Kevin MacLeod (incompetech.com) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Gymnopédie No. 1 (Satie) | "Gymnopedie No. 1" Kevin MacLeod (incompetech.com) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Love Song | "Love Song" Kevin MacLeod (incompetech.com) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| Fairytale Waltz | "Fairytale Waltz" Kevin MacLeod (incompetech.com) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

Source links for each file are in `MUSIC` in `src/lib/catalog.ts`. Only add tracks whose license you've verified: famous modern love songs are copyrighted, even as instrumental covers.
