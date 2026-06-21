# Mandalart — deployment guide

## What's here

```
mandalart-app/
  supabase/schema.sql        run this once in the Supabase SQL Editor
  src/
    lib/supabaseClient.js    the Supabase client
    context/AuthContext.jsx  session + profile, sign up/in/out
    hooks/useMandalart.js    loads/saves one mandalart's title, visibility, grid, notes
    api/friendsApi.js        friend-code lookup, requests, accept/decline, lists
    api/mandalartsApi.js     list/create your mandalarts, list a friend's public ones
    components/              every screen and grid piece
    App.jsx                  routing + auth gate
```

## 1. Supabase

1. Create a project at supabase.com.
2. Open the SQL Editor, paste in `supabase/schema.sql`, and run it top to bottom.
3. Authentication → Providers → Email: confirm it's enabled. **For testing, turn off "Confirm email"** under Authentication → Settings, or every sign-up will sit unconfirmed and unable to sign in until they click a verification link. Turn it back on before sharing the app with anyone outside your own testing.
4. Project Settings → API: copy the **Project URL** and the **anon public** key — you'll need both in step 3 below.

## 2. Run it locally

```
npm install
cp .env.example .env.local
# paste your Project URL and anon key into .env.local
npm run dev
```

Open the local URL, sign up with an email + password + display name. A profile row with a random `username#tag` friend code is created automatically. Create a mandalart, edit a few cells, refresh the page — your edits should still be there, loaded straight from Supabase.

To test the friend-viewing flow, sign up a second account (a different email) in the same project, add each other by exact code, set one mandalart to "Public" on the first account, and confirm the second account can open it read-only from Friends → View mandalarts.

## 3. Deploy

1. Push this folder to a new GitHub repository.
2. On vercel.com, "Add New… → Project", import that repository. Vercel auto-detects Vite — no build settings to change.
3. Before the first deploy, add the environment variables under Project Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (same values as your `.env.local`)
4. Deploy. Every future `git push` to the connected branch redeploys automatically.
5. Visit the live URL and repeat the two-account test from step 2 against production.

## Known gaps (next phases, not blockers for this deploy)

- Background music isn't wired in yet — upload your tracks to Supabase Storage and add a player component when you're ready.
- Real-time collaborative editing: `useMandalartRealtime` exists in `hooks/useMandalart.js` but isn't called from any component yet. Turning it on is the next step once there's a collaborator-invite UI (not just friend-viewing).
- PDF/PNG export isn't implemented.
- No password reset flow yet — if you get locked out during testing, reset the user from the Supabase dashboard (Authentication → Users).
