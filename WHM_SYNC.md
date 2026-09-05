# World Hookah Market catalog sync

`npm run sync:whm` refreshes the storefront catalog from `https://worldhookahmarket.com` and writes the product, category and brand snapshots consumed by the server.

The GitHub Actions workflow can be run manually or runs daily. The production build injects non-empty synced category and brand snapshots into the seed module and aligns the free-shipping threshold with the current WHM homepage value of $89.
