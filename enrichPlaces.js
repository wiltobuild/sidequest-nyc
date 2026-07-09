/*
  SideQuest NYC Google Places enrichment prototype.

  IMPORTANT:
  - This is prototype-only.
  - Set GOOGLE_PLACES_API_KEY in your local environment before running it.
  - Never commit real API keys to GitHub.
  - Do not import this script from frontend browser code.
  - Running this script calls Google Places Web Service endpoints and may use
    billable quota on the configured Google Cloud project.
*/

const fs = require("fs/promises");
const path = require("path");

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_PATH = path.join(__dirname, "places.json");
const REQUEST_DELAY_MS = 180;
const PHOTO_ONLY = process.argv.includes("--photos-only");

const textSearchEndpoint = "https://places.googleapis.com/v1/places:searchText";
const detailsEndpoint = "https://places.googleapis.com/v1/places";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSearchQuery(place) {
  const neighborhood = place.neighborhood || place.kingdom || "";
  return `${place.name} ${neighborhood} NYC`;
}

function googlePhotoUrl(photoName) {
  if (!photoName) return "";

  const params = new URLSearchParams({
    maxWidthPx: "900",
    key: GOOGLE_PLACES_API_KEY
  });

  return `https://places.googleapis.com/v1/${photoName}/media?${params.toString()}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body}`);
  }

  return response.json();
}

async function searchPlace(place) {
  const data = await fetchJson(textSearchEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName"
    },
    body: JSON.stringify({
      textQuery: buildSearchQuery(place),
      languageCode: "en"
    })
  });

  if (!data.places?.length) {
    return null;
  }

  return data.places[0];
}

async function fetchPlaceDetails(placeId) {
  const fieldMask = PHOTO_ONLY
    ? ["id", "photos.name", "photos.widthPx", "photos.heightPx"]
    : [
      "id",
      "formattedAddress",
      "rating",
      "userRatingCount",
      "currentOpeningHours",
      "regularOpeningHours",
      "photos.name",
      "photos.widthPx",
      "photos.heightPx"
    ];

  const data = await fetchJson(`${detailsEndpoint}/${encodeURIComponent(placeId)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": fieldMask.join(",")
    }
  });
  return data || null;
}

function openingHoursSummary(openingHours) {
  if (!openingHours) return "Check current hours before going";
  if (Array.isArray(openingHours.weekdayDescriptions) && openingHours.weekdayDescriptions.length > 0) {
    return openingHours.weekdayDescriptions.join(" | ");
  }
  if (typeof openingHours.openNow === "boolean") {
    return openingHours.openNow ? "Listed as open now; check current hours before going" : "Listed as closed now; check current hours before going";
  }

  return "Check current hours before going";
}

function mergeGoogleDetails(place, details) {
  const photoName = details.photos?.[0]?.name || "";

  if (PHOTO_ONLY) {
    return {
      ...place,
      googlePlaceId: details.id || place.googlePlaceId || "",
      googlePhotoReference: photoName || place.googlePhotoReference || "",
      photoUrl: photoName ? googlePhotoUrl(photoName) : place.photoUrl || ""
    };
  }

  return {
    ...place,
    googlePlaceId: details.id || place.googlePlaceId || "",
    googlePhotoReference: photoName || place.googlePhotoReference || "",
    address: details.formattedAddress || place.address || "",
    googleRating: typeof details.rating === "number" ? details.rating : place.googleRating,
    googleReviewCount: typeof details.userRatingCount === "number" ? details.userRatingCount : place.googleReviewCount,
    hoursNote: openingHoursSummary(details.currentOpeningHours || details.regularOpeningHours),
    photoUrl: photoName ? googlePhotoUrl(photoName) : place.photoUrl || ""
  };
}

async function enrichPlace(place, index, total) {
  const label = `[${index + 1}/${total}] ${place.name}`;
  console.log(PHOTO_ONLY ? `${label}: fetching photo` : `${label}: searching`);

  let placeId = place.googlePlaceId;

  if (!placeId) {
    const searchResult = await searchPlace(place);
    await sleep(REQUEST_DELAY_MS);

    if (!searchResult?.id) {
      console.log(`${label}: no Google result; keeping existing details`);
      return place;
    }

    placeId = searchResult.id;
  }

  const details = await fetchPlaceDetails(placeId);
  await sleep(REQUEST_DELAY_MS);

  if (!details) {
    console.log(`${label}: no details; keeping existing details`);
    return {
      ...place,
      googlePlaceId: placeId
    };
  }

  if (PHOTO_ONLY) {
    console.log(details.photos?.[0]?.name ? `${label}: photo added` : `${label}: no photo found`);
  } else {
    console.log(`${label}: enriched`);
  }

  return mergeGoogleDetails(place, details);
}

async function main() {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("Set GOOGLE_PLACES_API_KEY before running enrichPlaces.js.");
  }

  const raw = await fs.readFile(PLACES_PATH, "utf8");
  const places = JSON.parse(raw);
  const enrichedPlaces = [];

  for (let index = 0; index < places.length; index += 1) {
    try {
      enrichedPlaces.push(await enrichPlace(places[index], index, places.length));
    } catch (error) {
      console.warn(`[${index + 1}/${places.length}] ${places[index].name}: enrichment failed; keeping existing details`);
      console.warn(error.message);
      enrichedPlaces.push(places[index]);
    }
  }

  await fs.writeFile(PLACES_PATH, `${JSON.stringify(enrichedPlaces, null, 2)}\n`);
  console.log(`Saved ${enrichedPlaces.length} enriched places to ${PLACES_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
