# SideQuest NYC

SideQuest NYC is a beginner-friendly static web app that generates small NYC itineraries from a local JSON file.

Tagline: **Every day deserves a side quest.**

## Version Notes

### v1.0

The original working version was called **NYC Adventure Generator**. It provided the basic form, local filtering, itinerary generation, stop swapping, regeneration, and copy-to-clipboard behavior.

Archived in:

```text
archives/v1.0
```

### v1.1

v1.1 rebranded the app as **SideQuest NYC** and turned the experience into a polished NYC RPG-style quest generator.

Archived in:

```text
archives/v1.1
```

### v1.2A

v1.2A added the hero image, Realm/Kingdom UI, and responsive banner treatment.

Archived in:

```text
archives/v1.2A
```

### v1.2B

v1.2B expanded the local database to 104 locations and made Kingdom selection part of the actual matching logic.

- **Realm** means borough.
- **Kingdom** means neighborhood.
- Each place now includes `kingdom`, `nearbyKingdoms`, and `sourceNote`.
- Results show quest classification and stop-level match quality.

Archived in:

```text
archives/v1.2
```

### v1.3

v1.3 focused on making generated quests geographically smarter.

- Every place now includes approximate `latitude` and `longitude`.
- The app estimates distance between stops with the Haversine formula.
- Selected stops are reordered into a more logical walking route.
- Results show estimated route distance and route quality.
- The quest sheet includes an **Open Quest Route** Google Maps directions link.

Archived in:

```text
archives/v1.3
```

### v1.4A

v1.4A improved recommendation quality and made **Swap Encounter** reliable.

- Swap replaces only the clicked stop.
- Swap preserves the original stop role when possible.
- The recommendation score is now component-based and easier to reason about.
- Stop cards show a main reason selected in addition to match quality and why it fits.

Archived in:

```text
archives/v1.4A
```

### v1.4B

v1.4B added local Meta Quests, demo traveler reports, limited-time timed encounters, and manual weather awareness.

- Meta Quests are curated legendary quests stored in `metaQuests.json`.
- Traveler reports are static demo ratings, review counts, and short review highlights.
- Timed encounters use local `startDate` and `endDate` fields.
- Weather Mode adjusts custom recommendations and Meta Quest ranking.

Archived in:

```text
archives/v1.4B
```

### v1.5A

v1.5A cleaned up stop cards and removed repetitive explanation text.

- Removed "Main reason selected" and "Why this fits" from stop cards.
- Removed repeated preference-explanation copy from cards and copied quest text.
- Stop cards now focus on name, Kingdom, Realm, match quality, tags, duration, cost, leg distance, maps, and swap.
- The itinerary keeps one short quest summary at the top.

Archived in:

```text
archives/v1.5A
```

### v1.5B

v1.5B added Google-style place details to the local data model and stop cards.

- Each place supports `address`, `googleRating`, `googleReviewCount`, `hoursNote`, `photoUrl`, and `localTips`.
- Stop cards show rating, review count, address, hours note, and short local tip chips.
- Empty `photoUrl` values render as a styled placeholder instead of using fake images.
- Hours use cautious notes such as "Check current hours before going."

Archived in:

```text
archives/v1.5B
```

### v1.5 Google Places Enrichment Prototype

The current prototype adds a local Node.js enrichment script:

```text
enrichPlaces.js
```

The script reads `places.json`, searches Google Places for each local place, fetches details, and writes enriched fields back into `places.json`.

Prototype-only warning:

- Set `GOOGLE_PLACES_API_KEY` locally before running the enrichment script.
- Never commit a real API key to GitHub.
- Do not call Google Places from `app.js` or browser code.
- Running the script may use Google Cloud quota or incur API costs.

Archived in:

```text
archives/v1.5-google-enrichment-prototype
```

### v1.5A Guided Quest Wizard

The current working version replaces the large preference form with a guided RPG setup wizard.

- Users answer one question at a time instead of scanning a full form.
- The wizard has 6 stages: quest type, realm, kingdom, gold limit, quest length, and stamina.
- If the user chooses **Surprise Me** for Realm, the Kingdom stage is skipped.
- Each stage updates the same hidden fields used by the existing generator.
- Recommendation logic, route optimization, Meta Quests, weather mode, Realm/Kingdom filtering, and `places.json` remain unchanged.

## How to Run Locally

From this folder, start a small local server:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173
```

If `python` is not on your path, any simple static file server will work. A server is recommended because browsers often block `fetch("places.json")` when opening `index.html` directly from disk.

## Publishing to GitHub

Before publishing:

- Keep `.env` files private.
- Use `.env.example` as the public template for local API setup.
- Do not commit real Google API keys.
- The app itself is static and can be hosted with GitHub Pages.

Suggested repository contents:

- `index.html`
- `styles.css`
- `app.js`
- `places.json`
- `metaQuests.json`
- `README.md`
- `.gitignore`
- `.env.example`
- `assets/`
- `enrichPlaces.js`

The `archives/`, `outputs/`, and `work/` folders are ignored because they are local development history/helpers rather than the current app.

## Step-by-Step Experience

1. The user answers a guided RPG setup question.
2. Their answer animates into the next stage.
3. The progress bar updates with **Preparing Quest** language.
4. The Kingdom stage appears only when a specific Realm is selected.
5. After the stamina question, the existing SideQuest thinking animation appears.
6. The generated quest sheet appears with classification, route distance, route style, summary, and quest cards.
7. The user can reroll, edit preferences, swap one encounter, open Google Maps links, or copy the quest scroll.

## Guided Quest Wizard

The v1.5A wizard asks:

1. **What kind of quest are you seeking?**
2. **Which realm calls to you?**
3. **Choose your kingdom**
4. **How much gold can you spend?**
5. **How much time do you have for this quest?**
6. **What is your stamina level today?**

The visible wizard is a user-experience layer. It writes answers into the original form controls behind the scenes, so the existing generator can continue reading preferences through `getPreferences()`.

## Progress and Flavor Text

The wizard shows:

- **Preparing Quest**
- `Stage X of 6` or `Stage X of 5` when Kingdom is skipped
- a chunky pixel progress bar
- short rotating flavor text such as `Consulting local adventurers...` and `Checking tavern rumors...`

The transition is intentionally short, around a few hundred milliseconds, so the flow feels game-like without slowing users down.

## Kingdom Filtering

When a specific Kingdom is selected, the generator tries matches in this order:

1. **Exact Kingdom**: stops directly in the selected neighborhood.
2. **Nearby Kingdom**: stops in neighborhoods listed in `nearbyKingdoms`.
3. **Same Realm**: stops anywhere else in the selected borough.
4. **NYC-wide fallback**: stops from any borough if local data is too limited.

If the user chooses **Any Kingdom In This Realm**, the generator starts at same-Realm matching. If the user chooses **Surprise me**, it starts citywide.

## Quest Classification

The result sheet labels the route as one of:

- `Local Kingdom Quest`
- `Nearby Kingdom Quest`
- `Realm-Wide Quest`
- `Cross-Realm Quest`

Each stop card also shows:

- `Local Match`
- `Nearby Match`
- `Realm Match`
- `Cross-Realm Match`

Low Walking and Very Chill quests give extra scoring weight to local matches. Adventure Mode gives nearby kingdoms more room.

## Coordinates and Route Optimization

Each place in `places.json` includes approximate coordinates:

- `latitude`
- `longitude`

The app uses the Haversine formula to estimate straight-line distance in miles between stops. After the stops are selected, v1.3 reorders them with a simple nearest-neighbor route pass:

- Coffee, food, and market stops are favored near the beginning.
- Scenic, dessert, park, ferry, and show stops are favored near the end.
- Nearby next stops are preferred to reduce unnecessary travel.
- Very Chill and Low Walking choices apply a stronger distance penalty.
- Adventure Mode allows a looser route.

This is not a full map-routing engine, but it makes generated quests feel more geographically coherent.

## Route Quality Labels

The quest sheet shows total estimated route distance and one of these labels:

- `Compact Quest`: under 1.5 miles
- `Moderate Trek`: 1.5 to 3.5 miles
- `Sprawling Adventure`: over 3.5 miles

Each stop card also shows distance from the previous stop as `Next Leg`.

## Google Maps Route Generation

The **Open Quest Route** button builds a Google Maps walking directions URL from the selected stops:

- first stop as `origin`
- final stop as `destination`
- middle stops as `waypoints`

The route opens in Google Maps so the user can inspect or adjust it.

## Recommendation Scoring

v1.4A scores candidates with clearer weighted components:

- exact Kingdom, nearby Kingdom, same Realm, or cross-Realm match
- stop type fit for the current itinerary role
- number of matching vibes
- budget fit
- indoor-friendly fit when requested
- low-walking fit when requested
- distance from already selected stops
- small bonuses for relaxed, adventurous, or budget-friendly tags when relevant

Very Chill and Low Walking quests penalize distance more strongly. Adventure Mode still considers distance, but allows longer jumps.

## Swap Encounter Logic

Swap uses a dedicated replacement path instead of rerunning the whole itinerary.

When the user clicks **Swap Encounter**, the app:

1. Keeps every other stop.
2. Avoids places already in the itinerary.
3. Preserves the original stop role when possible.
4. Searches exact Kingdom first.
5. Falls back to nearby Kingdom.
6. Falls back to same Realm.
7. Uses NYC-wide fallback only if needed.

Role-preserving examples:

- coffee can swap to coffee, food, or market
- food can swap to food, coffee, or market
- scenic can swap to scenic, park, or ferry
- museum can swap to museum, activity, or bookstore

The route metrics update after the swap, but the clicked card is the only stop replaced.

## Meta Quests

Meta Quests are pre-curated SideQuests inside specific Kingdoms. They live in:

```text
metaQuests.json
```

Each Meta Quest includes:

- title, realm, kingdom, description
- vibes, estimated budget, estimated duration, stamina level
- stop names that map back to `places.json`
- event focus and limited-time flags
- start and end dates
- rating, review count, and review highlight
- tags for weather and seasonal matching

The app shows **Featured Meta Quests** that match the selected Realm, Kingdom, and vibe. It sorts them by a local score that includes rating, review count, event status, date-window activity, weather tags, and match quality.

## Traveler Reports

Reviews are proof-of-concept only. There is no backend and no user submission flow.

Each Meta Quest has static demo fields:

- `rating`
- `reviewCount`
- `reviewHighlight`

The UI displays these as traveler reports, for example:

```text
4.8 ★ · 23 traveler reports · "Best for a low-pressure sunset date."
```

## Timed Encounters

Limited-time and event-focused quests are handled locally with:

- `eventFocus`
- `limitedTime`
- `startDate`
- `endDate`

If today's date is inside the event window, the Meta Quest gets boosted. If the event is expired, the quest is hidden from Featured Meta Quests.

## Weather Mode

Weather Mode is a manual/demo selector. It does not use an API.

Options:

- Clear
- Rainy
- Cold
- Hot
- Windy

Weather affects both custom generation and Featured Meta Quests:

- Rainy boosts indoor places, museums, bookstores, cafes, markets, and indoor Meta Quests.
- Clear boosts parks, waterfront, scenic walks, and clear-weather Meta Quests.
- Cold boosts cafes, museums, indoor food halls, bookstores, and cozy routes.
- Hot boosts waterfront, ferries, shaded/scenic routes, museums, markets, and indoor stops.
- Windy boosts indoor stops and de-prioritizes ferries.

When weather affects a result, the quest sheet shows:

```text
Weather mode adjusted this quest.
```

## Files

- `index.html`: Page structure, guided wizard markup, hidden legacy preference controls, loading panel, results panel, classification label, route metrics, route button, and quest-card template.
- `styles.css`: Hero image treatment, dark NYC-night branding, guided wizard styling, responsive cards, match labels, route summary cells, buttons, and quest sheet styling.
- `app.js`: Loads local data, powers the guided wizard, updates Kingdom options, filters by fallback priority, scores recommendations, ranks Meta Quests, applies weather adjustments, reorders stops by route distance, classifies quests, renders match quality, handles reliable swap/reroll/copy/edit.
- `places.json`: Local database with 104 NYC places and activities.
- `metaQuests.json`: Local curated Meta Quest database with demo ratings, traveler reports, and timed encounters.
- `enrichPlaces.js`: Local prototype script that enriches `places.json` from Google Places Web Service.
- `assets/sidequest-hero.png`: Main hero artwork.
- `archives/`: Snapshots of earlier working versions.
- `work/build-places-v12b.js`: Helper script used to generate the expanded v1.2B dataset.

## How to Add New Locations

Add a new object to `places.json` with these fields:

```json
{
  "id": "unique-id",
  "name": "Place Name",
  "borough": "Queens",
  "kingdom": "Astoria",
  "latitude": 40.7644,
  "longitude": -73.9235,
  "address": "Place Name, Astoria, Queens, NY",
  "googleRating": 4.6,
  "googleReviewCount": 850,
  "hoursNote": "Check current hours before going",
  "photoUrl": "",
  "localTips": ["Useful as a meet-up point before the route."],
  "nearbyKingdoms": ["LIC", "Sunnyside"],
  "neighborhood": "Astoria",
  "type": "food",
  "costLevel": "$",
  "vibes": ["food-focused", "relaxed"],
  "indoorOutdoor": "indoor",
  "alcoholFree": true,
  "lowWalking": true,
  "durationMinutes": 45,
  "description": "Original short description.",
  "mapsQuery": "Place Name Astoria NYC",
  "sourceNote": "Inspired by Eater NY-style neighborhood dining coverage."
}
```

Keep `id` unique, use one of the existing `type` values, and keep descriptions original. Add approximate coordinates and nearby kingdoms that make sense for the selected neighborhood so fallback matching and route estimates can work.

## Google Places Enrichment Prototype

Run this locally from the project folder:

```powershell
$env:GOOGLE_PLACES_API_KEY="your_google_places_api_key_here"
node enrichPlaces.js
```

For photo-only enrichment:

```powershell
$env:GOOGLE_PLACES_API_KEY="your_google_places_api_key_here"
node enrichPlaces.js --photos-only
```

The script:

1. Reads `places.json`.
2. Searches Google Places using `name + neighborhood + NYC`.
3. Fetches:
   - Google Place ID
   - formatted address
   - rating
   - user rating count
   - opening hours summary when available
   - one photo reference when available
4. Saves those fields back into `places.json`.
5. Leaves SideQuest fields such as `vibes`, `kingdom`, `nearbyKingdoms`, route coordinates, and local tips untouched.

Fields written by the script:

- `googlePlaceId`
- `googlePhotoReference`
- `address`
- `googleRating`
- `googleReviewCount`
- `hoursNote`
- `photoUrl`

Photo support uses Google Place Photos API URLs. If no Google photo is available, `photoUrl` stays empty and the UI shows the styled placeholder.

## How to Add New Meta Quests

Add a new object to `metaQuests.json`:

```json
{
  "id": "romantic-lic-sunset",
  "title": "Romantic LIC Sunset Quest",
  "realm": "Queens",
  "kingdom": "LIC",
  "description": "Original curated quest description.",
  "vibes": ["romantic", "scenic"],
  "estimatedBudget": "Under $50",
  "estimatedDuration": "3-4 hours",
  "staminaLevel": "Very chill",
  "stops": ["Sweetleaf Coffee", "Gantry Plaza State Park"],
  "eventFocus": false,
  "limitedTime": false,
  "startDate": "",
  "endDate": "",
  "rating": 4.8,
  "reviewCount": 23,
  "reviewHighlight": "Best for a low-pressure sunset date.",
  "tags": ["waterfront", "date", "clear-weather"]
}
```

Every stop name should exactly match a `name` in `places.json`.

## Known Limitations

- Coordinates are approximate and used for simple distance estimates.
- Route distance is straight-line distance, not exact sidewalk or subway distance.
- Google Maps may reorder or adjust the route based on real streets.
- Swap quality depends on having enough same-role places in the selected Kingdom or nearby Kingdoms.
- Meta Quest reviews are demo data, not real user reviews.
- Timed encounters are local date-window demos, not live event listings.
- Weather Mode is manual and does not use live weather data.
- Google Places enrichment is a local prototype script, not a production-safe API integration.
- Google Places data freshness depends on when `enrichPlaces.js` was last run.
- Some neighborhoods still have deeper coverage than others.
- `sourceNote` is a lightweight provenance note, not a live citation system.

## Pixel Art Assets

SideQuest uses a curated set of PNG assets from the Pixel Crawler Free Pack by Anokolisa for decorative quest-board details, including the party sprites, loading campfire, Meta Quest atmosphere, and fallback food visuals. The pack's included terms are preserved at `assets/pixel-crawler/LICENSE.txt`.

The assets are used as supporting UI decoration only; NYC location imagery and itinerary data remain independent of the pack.
