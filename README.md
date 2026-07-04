# Coach V5

Coach is a local-first workout companion for guided gym sessions, workout plans, exercise history, equipment guidance, personalized defaults, and achievement badges.

## Run locally

Open `index.html` in a modern browser. No account, server, build step, or hosted service is required. App data is saved in the browser with local storage and can be exported from Settings.

For local HTTP testing, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Release contents

- `index.html`, `app.js`, and `styles.css`: application shell and UI
- `data/`: exercise and badge content
- `js/`: icons, avatar helpers, badge art, and muscle-map helpers
- `images/`: transparent machine, avatar, badge, and anatomy assets
- `manifest.webmanifest`: installable web-app metadata
- `V5_LOCKED_HANDOFF.md`: implementation and verification record
- `CONTENT_AND_ASSET_AUDIT.md`: catalog and asset coverage

## Current validation

- JavaScript syntax checks pass.
- All 38 exercises have both thumbnail and in-use artwork.
- All 38 list thumbnails received a final edge-connected matte cleanup.
- All referenced machine images are present.
