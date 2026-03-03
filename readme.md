# sofigo

A transit app for routes, stops, and departures using static GTFS.

## requirements

- Bun
- Postgres 17 (docker or local install)

## configure env

```bash
cp .env.example .env
```

## start database

```bash
docker compose up -d db
```

## apply schema

```bash
bun run --cwd backend prisma:push
```

## import gtfs

get the static GTFS zip from:
https://mobilitas.biokom.hu/google

```bash
bun run gtfs:import <path-to-zip>
```

## run

```bash
bun run dev
```

uses turbo to run both backend and mobile in parallel

## api

- `GET /routes`
- `GET /stops/nearby?lat=46.07&lon=18.23&radiusMeters=500&limit=30`
- `GET /stops/{id}/departures?date=2026-03-03&time=12:30:00&limit=30`

## db notes

enabled extensions:

- `cube`
- `earthdistance`

these are enough for nearby stop distance queries
