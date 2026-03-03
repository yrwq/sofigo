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

## db notes

enabled extensions:

- `cube`
- `earthdistance`

these are enough for nearby stop distance queries
