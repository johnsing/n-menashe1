"use client";
// Zmanim Train — prerender-safe: `new Date()` / localStorage are only read
// via useSyncExternalStore subscriptions, never during render.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FiNavigation } from "react-icons/fi";
import TransitHeader from "@/app/components/Zmanim/TransitHeader";
import TimelineStation from "@/app/components/Zmanim/TimelineStation";
import {
  fetchZmanim,
  fetchShabbat,
  shabbatStations,
  toApiDate,
  type ShabbatInfo,
  type Station,
} from "@/app/lib/zmanim";
import {
  PRESET_LOCATIONS,
  ALL_PRESET_LOCATIONS,
  DEFAULT_LOCATION,
  findPresetLocation,
  loadSavedLocation,
  subscribeToSavedLocation,
  saveLocation,
  locationFromCoords,
  isCurrentLocation,
  type ZmanimLocation,
} from "@/app/utils/zmanimLocations";

// ── 15-second shared clock ──────────────────────────────────
let clockSnapshot: Date | null = null;
let clockInterval: ReturnType<typeof setInterval> | undefined;
const clockSubs = new Set<() => void>();

function subscribeClock(cb: () => void) {
  clockSubs.add(cb);
  if (!clockInterval) {
    clockSnapshot = new Date();
    clockInterval = setInterval(() => {
      clockSnapshot = new Date();
      clockSubs.forEach((s) => s());
    }, 15_000);
    cb();
  }
  return () => {
    clockSubs.delete(cb);
    if (clockSubs.size === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = undefined;
      clockSnapshot = null;
    }
  };
}
const getClock = () => clockSnapshot;
const getServerClock = () => null;
const getServerLocation = () => DEFAULT_LOCATION;

const EMPTY_SHABBAT: ShabbatInfo = {
  candleLighting: null,
  havdalah: null,
  parasha: null,
};

/** Keep technical fetch errors out of the board. */
function loadErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("no zmanim")) {
      return "No times are published for this date.";
    }
    if (error.message.includes("Failed to fetch")) {
      return "Check your internet connection and try again.";
    }
    if (error.message.includes("request failed")) {
      return "The times service is temporarily unavailable.";
    }
  }
  return "Please try again in a moment.";
}

export default function ZmanimTrainApp() {
  const now = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const location = useSyncExternalStore(
    subscribeToSavedLocation,
    loadSavedLocation,
    getServerLocation,
  );

  const [stations, setStations] = useState<Station[]>([]);
  const [shabbat, setShabbat] = useState<ShabbatInfo>(EMPTY_SHABBAT);
  const [locationTitle, setLocationTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const dateKey = now ? toApiDate(now, location.tzid) : "";

  // Single source of fetching: date / location / retry changes.
  // Shabbat info is fetched alongside; if it fails, the board still loads.
  useEffect(() => {
    if (!dateKey) return;
    let active = true;

    (async () => {
      const shabbatPromise = fetchShabbat(
        location.params,
        dateKey,
        location.tzid,
      ).catch(() => EMPTY_SHABBAT);
      try {
        const [result, shabbatResult] = await Promise.all([
          fetchZmanim(dateKey, location.params, location.label),
          shabbatPromise,
        ]);
        if (!active) return;
        setStations(result.stations);
        setShabbat(shabbatResult);
        setLocationTitle(result.locationTitle);
        setError(null);
      } catch (e) {
        if (active) setError(loadErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dateKey, location, retryCount]);

  // ── location handlers (event handlers — safe) ─────────────
  const choosePreset = (id: string) => {
    const loc = findPresetLocation(id);
    if (!loc) return;
    setGeoError(null);
    setLoading(true);
    setError(null);
    setStations([]);
    setShabbat(EMPTY_SHABBAT);
    setLocationTitle("");
    saveLocation(loc);
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = locationFromCoords(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setLoading(true);
        setError(null);
        setStations([]);
        setShabbat(EMPTY_SHABBAT);
        setLocationTitle("");
        saveLocation(loc);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — choose a city from the list instead."
            : "Could not determine your location. Try again or pick a city.",
        );
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  };

  // Zmanim + tonight's Shabbat rows, chronological.
  const allStations = useMemo(() => {
    const shabbatRows = shabbatStations(shabbat);
    if (shabbatRows.length === 0) return stations;
    return [...stations, ...shabbatRows].sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );
  }, [stations, shabbat]);

  const nextStation = useMemo(() => {
    if (!now) return null;
    return allStations.find((s) => s.time.getTime() > now.getTime()) ?? null;
  }, [allStations, now]);

  // Train-board behaviour: keep the last hour + everything upcoming.
  const visible = useMemo(() => {
    if (!now) return [];
    const cutoff = now.getTime() - 60 * 60_000;
    return allStations.filter((s) => s.time.getTime() >= cutoff);
  }, [allStations, now]);

  const isPreset = ALL_PRESET_LOCATIONS.some((l) => l.id === location.id);
  const locationName = locationTitle || location.label;

  return (
    <div className="zt-app">
      <TransitHeader
        location={locationName}
        nextStation={nextStation}
        parasha={shabbat.parasha}
        timeZone={location.tzid}
        loading={loading}
        error={!!error}
      />

      <main className="zt-content">
        <div className="zt-toolbar">
          <div className="zt-field">
            <label className="zt-field-label" htmlFor="zt-location">
              Location
            </label>
            <div className="zt-select-wrap">
              <select
                id="zt-location"
                className="zt-select"
                value={location.id}
                onChange={(e) => choosePreset(e.target.value)}
              >
                {isCurrentLocation(location) && (
                  <option value="current">Current location</option>
                )}
                {!isCurrentLocation(location) && !isPreset && (
                  <option value={location.id}>{location.label}</option>
                )}
                {PRESET_LOCATIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.locations.map((l: ZmanimLocation) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="zt-select-chevron" aria-hidden="true" />
            </div>
          </div>

          <button
            type="button"
            className="zt-geo"
            onClick={useMyLocation}
            disabled={geoLoading}
          >
            <FiNavigation aria-hidden="true" />
            {geoLoading ? "Locating…" : "Use my location"}
          </button>

          {geoError && (
            <p className="zt-geo-error" role="alert">
              {geoError}
            </p>
          )}
        </div>

        <section
          className="zt-board-panel"
          aria-labelledby="zt-today"
          aria-busy={loading}
        >
          <header className="zt-board-head">
            <div>
              <p className="zt-eyebrow">Departure board</p>
              <h2 id="zt-today" className="zt-section">
                Today&apos;s Zmanim
              </h2>
            </div>
            <p className="zt-board-summary" aria-live="polite">
              {error
                ? "Unavailable"
                : loading
                  ? "Updating…"
                  : `${visible.length} ${
                      visible.length === 1 ? "time" : "times"
                    }`}
            </p>
          </header>

          {error ? (
            <div className="zt-error" role="alert">
              <strong>Couldn&apos;t reach Hebcal</strong>
              <small>{error}</small>
              <button
                className="zt-retry"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setRetryCount((c) => c + 1);
                }}
              >
                Try again
              </button>
            </div>
          ) : loading && allStations.length === 0 ? (
            <div className="zt-skeletons" aria-hidden="true">
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
            </div>
          ) : visible.length === 0 ? (
            <div className="zt-empty" role="status">
              All of today&apos;s zmanim have passed. Tomorrow&apos;s times
              arrive at midnight.
            </div>
          ) : (
            <TimelineStation
              stations={visible}
              now={now ?? new Date()}
              nextId={nextStation?.id}
              timeZone={location.tzid}
            />
          )}
        </section>

        <footer className="zt-foot">
          <p>
            Times for {locationName} from{" "}
            <a
              href="https://www.hebcal.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hebcal
            </a>
            .
          </p>
          <p>Halachic times vary by community — verify with your local calendar.</p>
        </footer>
      </main>
    </div>
  );
}
