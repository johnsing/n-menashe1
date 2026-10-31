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

  const dateKey = now ? toApiDate(now) : "";

  // Single source of fetching: date / location / retry changes.
  // Shabbat info is fetched alongside; if it fails, the board still loads.
  useEffect(() => {
    if (!dateKey) return;
    let active = true;
    const date = new Date(`${dateKey}T00:00:00`);

    (async () => {
      const shabbatPromise = fetchShabbat(location.params, date).catch(
        () => EMPTY_SHABBAT,
      );
      try {
        const [result, shabbatResult] = await Promise.all([
          fetchZmanim(date, location.params, location.label),
          shabbatPromise,
        ]);
        if (!active) return;
        setStations(result.stations);
        setShabbat(shabbatResult);
        setLocationTitle(result.locationTitle);
        setError(null);
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load zmanim");
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

  return (
    <div className="zt-app">
      <TransitHeader
        location={locationTitle || location.label}
        nextStation={now ? nextStation : null}
        parasha={shabbat.parasha}
      />

      <main className="zt-content">
        <div className="zt-picker">
          <select
            className="zt-select"
            value={location.id}
            onChange={(e) => choosePreset(e.target.value)}
            aria-label="Choose location"
          >
            {isCurrentLocation(location) && (
              <option value="current">📍 Current location</option>
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

        <h2 className="zt-section">Today&apos;s Zmanim</h2>

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
          </div>
        ) : visible.length === 0 ? (
          <div className="zt-empty">
            All of today&apos;s zmanim have passed. Tomorrow&apos;s times
            arrive at midnight.
          </div>
        ) : (
          <TimelineStation
            stations={visible}
            now={now ?? new Date()}
            nextId={nextStation?.id}
          />
        )}
      </main>
    </div>
  );
}
