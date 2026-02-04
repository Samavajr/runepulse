# RunePulse

RunePulse is a RuneLite telemetry stack for OSRS: a plugin that captures XP/gear/boss KC, a Fastify API for ingest + analytics, and a Next.js web app for profiles, charts, and goals.

## Repo layout
- `api/` Fastify API + Postgres schema
- `web/` Next.js web app
- `runelite-plugin/` (legacy standalone plugin; current plugin lives in your RuneLite source repo)