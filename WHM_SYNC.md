# World Hookah Market catalog sync

The storefront now supports a repeatable catalog sync from `https://worldhookahmarket.com`.

## Manual sync

```bash
npm install
npm run sync:whm
npm run build
```

The sync writes:

- `src/server/db/scrapedProducts.json`
- `src/server/db/scrapedCategories.json`
- `src/server/db/scrapedBrands.json`
- `src/server/db/worldhookahmarket-sync.json`

## GitHub Actions

Use **Actions → Sync World Hookah Market Catalog → Run workflow** to refresh the catalog. The workflow also runs every day and commits changed catalog data.

The build step injects the synced category and brand metadata into the server seed module and keeps the free-shipping threshold aligned with the current WHM homepage value of $89.
