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
- Rail integration is wired via Next.js route handlers in `app/api/rail/*`.
- Set `RAIL_MOCK=false` and add Rail credentials to talk to Rail for real.
