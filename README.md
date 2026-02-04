# RunePulse

RunePulse is a RuneLite telemetry stack for OSRS: a plugin that captures XP/gear/boss KC, a Fastify API for ingest + analytics, and a Next.js web app for profiles, charts, and goals.

## Repo layout
- `api/` Fastify API + Postgres schema
- `web/` Next.js web app
- `runelite-plugin/` (legacy standalone plugin; current plugin lives in your RuneLite source repo)

## Local dev
### API
```
cd api
npm install
node src/server.js
```

### Web
```
cd web
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE` in `web/.env` if your API isn’t on `http://localhost:3001`.

## Deploy (cheap + simple)
### Railway (API + Postgres)
1. Create a Railway project and add **Postgres**.
2. Deploy `api/` from GitHub as a Node service.
3. Railway provides `DATABASE_URL` automatically.
4. Set `PORT` if needed (Railway sets it by default).

### Vercel (Web)
1. Import the repo in Vercel.
2. Set `NEXT_PUBLIC_API_BASE` to your Railway API URL.
3. Deploy.

## RuneLite plugin
- Update the plugin API base URL in `TelemetryUploader.java` to your deployed API URL.
- Run RuneLite from source while developing.
- For public distribution, submit the plugin to the RuneLite Plugin Hub.

## Notes
- This project does **not** collect emails or passwords. It only records in-game telemetry (XP, gear, boss KC).
