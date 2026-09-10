# Explore data foundation

The Explore and Near You UI can now consume a provider-independent place API. The first implementation keeps the existing UI untouched and establishes the production data boundary.

## Runtime endpoints

- `GET /api/explore/search?q=coffee&category=cafes&lat=22.5726&lng=88.3639&limit=20`
- `GET /api/explore/nearby?lat=22.5726&lng=88.3639&radiusKm=5&category=food&limit=20`
- `GET /api/explore/map?west=88.32&south=22.52&east=88.42&north=22.62&category=culture&limit=300&cursor=0`

The map endpoint prefers the canonical PostgreSQL place repository and falls back to local Overture catalogue tiles when the database is unavailable or has not been migrated. It returns `total` and `nextCursor` metadata for Grid/List pagination. Text and nearby searches use the same repository chain. When results are sparse and private Ola Places credentials are configured, they request Ola, normalize its result shape, remove duplicates, and merge the results. Provider failure returns available local results instead of breaking the page.

## Local development catalogue

The generated catalogue lives in `data/explore/catalog` and is intentionally git-ignored. It is isolated from `DATABASE_URL`; importing or querying it cannot alter the shared PostgreSQL database.

Download an official Overture `place` GeoJSON sequence for the Greater Kolkata bounding box, then normalize it:

```powershell
python -m pip install overturemaps==1.0.2
python -m overturemaps download --bbox=88.20,22.45,88.55,22.75 -f geojsonseq -t place -o greater-kolkata.geojsonl
node scripts/import-overture-places.mjs --input greater-kolkata.geojsonl --output data/explore/catalog --min-confidence 0.45
```

The importer removes low-confidence and non-discovery directory records, deduplicates close name/coordinate matches, maps Overture categories into the product taxonomy, and writes small geographic JSON tiles plus a provenance manifest. The current local import contains 36,288 discovery places across Greater Kolkata. Set `EXPLORE_CATALOG_DIR` only when a different generated catalogue location is required.

## Credentials

Copy `.env.example` to `.env` and supply separate credentials:

- `NEXT_PUBLIC_OLA_MAPS_API_KEY` is the origin-restricted browser map key.
- `OLA_MAPS_API_KEY` is read only by the server-side Places adapter. It may initially use the same Ola credential value as the browser key.
- `OLA_MAPS_REQUEST_ORIGIN` must exactly match one of that credential's Allowed Domains (for example, `http://localhost:3000`). Ola rejects an otherwise valid domain-restricted key when the server request omits the allowed origin.

For production, prefer separate Ola credentials for browser rendering and server-side Places calls so they can be restricted and rotated independently.

The Ola endpoint paths are configurable because accounts or future API versions may use different paths. Confirm the assigned endpoints in the Ola API console before production deployment.

## Database rollout

The migration adds the canonical place graph, editorial collections, experiences, provenance, photos, interaction events, search events, `pg_trgm`, and a PostGIS generated geography point with a GiST index.

Before applying it to any shared database:

1. Take a database backup.
2. Test the migration against a staging copy.
3. Confirm the database permits the `postgis` and `pg_trgm` extensions.
4. Run `npx prisma migrate deploy` from the release pipeline.
5. Run `npm run db:seed` only for a new development database, never against production content.
6. Set `EXPLORE_DATABASE_ENABLED=true` only after the migration and initial place import succeed. Until then, Explore uses the ignored local catalogue and does not query the shared database for the new place schema.

Preview a catalogue import without opening a database connection:

```powershell
npm run data:import:places -- --limit=100
```

After staging approval, enable the database flag and use both explicit write guards:

```powershell
npm run data:import:places -- --write --confirm=IMPORT_EXPLORE_CATALOG
```

## Next increment

The next increment should add the shared place drawer/bottom sheet and make Explore categories, trending cards, hidden places, and collections open filtered results using this catalogue.

## Image enrichment

When a user opens a place, MyKolkata requests Ola Advanced Details and falls back to basic details. If Ola has no photo, the server queries Wikimedia Commons for geotagged images within 350 metres and only accepts titles with a strong place-name match. Every accepted image retains its public image URL, source-page URL, provider, attribution, licence, confidence, and verification time. Image bytes are not stored in the application database.

Never treat a publicly reachable image as automatically reusable. An asynchronous enrichment worker may inspect an official venue website, an approved Places provider, or a clearly licensed media repository and write a candidate `PlacePhoto`. Only a venue-name and location match with acceptable source rights may be promoted to `VERIFIED`. The product renders verified exact-place photos; otherwise it shows an honest category visual with “Photo not available.” Do not scrape images during a map request or user click because that creates slow, fragile, and rate-limited UX.

Preview an enrichment batch without using the network or database:

```powershell
npm run data:enrich:images -- --limit=10
```

Run discovery without writing, then use guarded write mode only against an approved staging database:

```powershell
npm run data:enrich:images -- --execute --limit=10
npm run data:enrich:images -- --execute --write --confirm=WRITE_IMAGE_CANDIDATES --limit=10
```

Official-site images discovered through Anakin remain `CANDIDATE`, because a public URL does not prove reuse rights. Wikimedia candidates are auto-verified only when the place match is strong and a recognized reusable license is present. The database stores remote URLs and their provenance, provider, attribution, and license—not image bytes. Anakin is optional; set the private `ANAKIN_API_KEY` only for enrichment jobs.
