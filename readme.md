# sofigo

Public transit companion that shows nearby stops, upcoming arrivals, and full route schedules.

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

## run

```bash
bun run dev
```

uses turbo to run both backend and mobile in parallel

## api

docs are available via Swagger at `http://localhost:3000/docs`.
