# sofigo

## gtfs

get zips from https://mobilitas.biokom.hu/google

## db: 

extensions:

- `cube`
- `earthdistance`

for nearby stop distance queries

```bash
# start
docker compose up -d db
```

```bash
# connect
docker compose exec db psql -U postgres -d sofigo
```
