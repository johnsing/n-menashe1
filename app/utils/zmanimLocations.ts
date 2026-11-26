export interface ZmanimLocation {
  id: string;
  label: string;
  params: string;
  tzid: string;
}

export const PRESET_LOCATIONS: {
  group: string;
  locations: ZmanimLocation[];
}[] = [
  {
    group: "Jerusalem",
    locations: [
      {
        id: "jerusalem",
        label: "Jerusalem",
        params: "geonameid=281184",
        tzid: "Asia/Jerusalem",
      },
    ],
  },
  {
    group: "North",
    locations: [
      {
        id: "haifa",
        label: "Haifa",
        params: "geonameid=294801",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "tiberias",
        label: "Tiberias",
        params: "geonameid=293322",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "tzfat",
        label: "Tzfat (Safed)",
        params: "geonameid=293100",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "akko",
        label: "Akko (Acre)",
        params: "geonameid=295721",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "nazareth",
        label: "Nazareth",
        params: "geonameid=294098",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "maalot tarshīhā",
        label: "Maalot Tarshīhā",
        params: "geonameid=293420",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "karmiel",
        label: "Karmiel",
        params: "geonameid=294577",
        tzid: "Asia/Jerusalem",
      },
      {
        id: "bet she’an",
        label: "Bet She’an",
        params: "geonameid=295435",
        tzid: "Asia/Jerusalem",
      },
    ],
  },
  {
    group: "South",
    locations: [
      {
        id: "sderot",
        label: "Sderot",
        params: "geonameid=293619",
        tzid: "Asia/Jerusalem",
      },
    ],
  },
];

export const ALL_PRESET_LOCATIONS = PRESET_LOCATIONS.flatMap(
  (group) => group.locations,
);

export const DEFAULT_LOCATION: ZmanimLocation =
  ALL_PRESET_LOCATIONS.find((location) => location.id === "jerusalem") ??
  ALL_PRESET_LOCATIONS[0];

export function findPresetLocation(id: string): ZmanimLocation | undefined {
  return ALL_PRESET_LOCATIONS.find((location) => location.id === id);
}

const STORAGE_KEY = "n-menashe:zmanim-location";
const LOCATION_EVENT = "n-menashe:location-change";

let cachedRaw: string | null | undefined;
let cachedLocation: ZmanimLocation = DEFAULT_LOCATION;

function parseSavedLocation(raw: string | null): ZmanimLocation {
  if (!raw) return DEFAULT_LOCATION;

  try {
    const saved = JSON.parse(raw) as Partial<ZmanimLocation>;
    if (typeof saved.params !== "string") return DEFAULT_LOCATION;

    return {
      id: saved.id ?? "saved",
      label: saved.label ?? "Saved location",
      params: saved.params,
      tzid: saved.tzid ?? "Asia/Jerusalem",
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

// useSyncExternalStore compares snapshots with Object.is, so the same object
// must be returned until the stored value changes.
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
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCATION_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCATION_EVENT, onChange);
  };
}

export function saveLocation(location: ZmanimLocation): void {
  const serialized = JSON.stringify(location);

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage is unavailable in private mode.
  }

  cachedRaw = serialized;
  cachedLocation = location;
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

export function locationFromCoords(
  latitude: number,
  longitude: number,
): ZmanimLocation {
  return {
    id: "current",
    label: "Current location",
    params: `latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}`,
    tzid: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

export const isCurrentLocation = (location: ZmanimLocation) =>
  location.id === "current";
