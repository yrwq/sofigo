# sofigo

Public transit companion that shows nearby stops, upcoming arrivals, and full route schedules.

> [!NOTE]
> Could be useful by me only, this repo is a demo/showcase app for portfolio purposes.

## requirements

- Bun
- Postgres 17 (docker or local install)

Node version is pinned in `.node-version`.

## run

1. configure env

```bash
cp .env.example .env
```

2. install deps

```bash
bun install
```

3. start db

```bash
docker compose up -d db
```

4. apply schema

```bash
bun run --cwd backend prisma:push
```

5. start backend + mobile

```bash
bun run dev
```

Uses turbo to run both backend and mobile in parallel.

API docs are available via Swagger at `http://localhost:3000/docs` (or your backend URL).
