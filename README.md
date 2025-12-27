# AtlasPay App (MVP dashboard)

Login + dashboard + contractors + send payment + payouts + settings.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

### Notes
- If you do NOT set Supabase keys, login runs in **DEMO mode** (any email/password works).
- Rail integration is wired via Next.js route handlers in `app/api/rail/*` (forced to the Node runtime for Vercel compatibility).
- Set `RAIL_MOCK=false` and add Rail credentials to talk to Rail for real.
- Copy `.env.example` to `.env.local` and set:
  - `RAIL_CLIENT_ID` / `RAIL_CLIENT_SECRET`
  - `RAIL_ENV` (`sandbox` or `production`), `RAIL_SCOPES` if you need to override defaults
  - Leave `RAIL_MOCK=true` for local smoke tests without hitting the API
- The send flow fetches `/api/rail/config` to show connectivity (env/base/scopes/credential presence) and errors early if live creds are missing.
- Deploying to Vercel: add the Rail env vars in the project settings (Environment Variables) and set `RAIL_MOCK=false` if you want to call the live API. No extra config is required; the API routes run in the Node runtime on Vercel.
