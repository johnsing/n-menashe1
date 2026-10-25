// app/utils/zmanimLocations.ts — preset cities + geolocation + localStorage

export interface ZmanimLocation {
  id: string;
  label: string;
  params: string;
}

export const PRESET_LOCATIONS: { group: string; locations: ZmanimLocation[] }[] = [
  {
    group: "Jerusalem",
    locations: [{ id: "jerusalem", label: "Jerusalem", params: "geonameid=281184" }],
  },
  {
    group: "Center",
    locations: [
      { id: "telaviv", label: "Tel Aviv", params: "geonameid=293397" },
    ],
  },
  {
    group: "North",
    locations: [
      { id: "haifa", label: "Haifa", params: "geonameid=294801" },
      { id: "tiberias", label: "Tiberias", params: "geonameid=293322" },
      { id: "tzfat", label: "Tzfat (Safed)", params: "geonameid=293100" },
      { id: "akko", label: "Akko (Acre)", params: "geonameid=295721" },
      { id: "nazareth", label: "Nazareth", params: "geonameid=294098" },
      { id: "maalot tarshīhā", label: "Maalot Tarshīhā", params: "geonameid=293420" },
      { id: "karmiel", label: "Karmiel", params: "geonameid=294577" },
      { id: "bet she’an", label: "Bet She’an", params: "geonameid=295435" },

    ],
  },
  {
    group: "South",
    locations: [
      { id: "sderot", label: "Sderot", params: "geonameid=293619" },
    ],
  },
];

export const ALL_PRESET_LOCATIONS: ZmanimLocation[] =
  PRESET_LOCATIONS.flatMap((g) => g.locations);

export const DEFAULT_LOCATION: ZmanimLocation =
  ALL_PRESET_LOCATIONS.find((l) => l.id === "jerusalem") ?? ALL_PRESET_LOCATIONS[0];

export function findPresetLocation(id: string): ZmanimLocation | undefined {
  return ALL_PRESET_LOCATIONS.find((l) => l.id === id);
}

// ── localStorage persistence (browser-only) ─────────────────
// IMPORTANT: getSnapshot results are compared with Object.is —
// loadSavedLocation must return the SAME object reference until
// the stored value actually changes, or React loops forever.

const STORAGE_KEY = "n-menashe:zmanim-location";
const LOCATION_EVENT = "n-menashe:location-change";

let cachedRaw: string | null | undefined;
let cachedLocation: ZmanimLocation = DEFAULT_LOCATION;

function parseSavedLocation(raw: string | null): ZmanimLocation {
  if (!raw) return DEFAULT_LOCATION;
  try {
    const parsed = JSON.parse(raw) as ZmanimLocation;
    return parsed && typeof parsed.params === "string" ? parsed : DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function loadSavedLocation(): ZmanimLocation {
  if (typeof window === "undefined") return DEFAULT_LOCATION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedLocation = parseSavedLocation(raw);
    }
    return cachedLocation;
  } catch {
    return cachedLocation;
  }
}

export function subscribeToSavedLocation(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCATION_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCATION_EVENT, onChange);
  };
}

export function saveLocation(loc: ZmanimLocation): void {
  const serialized = JSON.stringify(loc);
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    /* private mode — ignore */
  }
  // Keep the cache in sync so the next getSnapshot returns this same object.
  cachedRaw = serialized;
  cachedLocation = loc;
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

export function locationFromCoords(lat: number, lon: number): ZmanimLocation {
  return {
    id: "current",
    label: "Current location",
    params: `latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`,
  };
}

export const isCurrentLocation = (loc: ZmanimLocation) => loc.id === "current";