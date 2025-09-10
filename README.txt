Quick start:
1) Put your two logo files at:
   - apps/frontend/public/logos/primary.png
   - apps/frontend/public/logos/alt.png

2) Create a Supabase project and run: supabase/schema.sql (copy into SQL Editor)

3) Create .env in repo root with:
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   (and .env.local inside apps/frontend with public keys)

4) Install & run:
   corepack enable
   corepack prepare pnpm@latest --activate
   pnpm i
   pnpm dev:all

5) Sign up in the app, then POST to /tenants/bootstrap with your Supabase Auth user ID to attach a tenant.
