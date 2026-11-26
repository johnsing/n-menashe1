"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FiNavigation } from "react-icons/fi";

import TransitHeader from "@/app/components/Zmanim/TransitHeader";
import TimelineStation from "@/app/components/Zmanim/TimelineStation";
import {
  fetchShabbat,
  fetchZmanim,
  shabbatStations,
  toApiDate,
  type ShabbatInfo,
  type Station,
} from "@/app/lib/zmanim";
import {
  ALL_PRESET_LOCATIONS,
  DEFAULT_LOCATION,
  PRESET_LOCATIONS,
  findPresetLocation,
  isCurrentLocation,
  loadSavedLocation,
  locationFromCoords,
  saveLocation,
  subscribeToSavedLocation,
  type ZmanimLocation,
} from "@/app/utils/zmanimLocations";

let clockSnapshot: Date | null = null;
let clockInterval: ReturnType<typeof setInterval> | undefined;
const clockSubscribers = new Set<() => void>();

function subscribeClock(onChange: () => void) {
  clockSubscribers.add(onChange);

  if (!clockInterval) {
    clockSnapshot = new Date();
    clockInterval = setInterval(() => {
      clockSnapshot = new Date();
      clockSubscribers.forEach((subscriber) => subscriber());
    }, 15_000);
    onChange();
  }

  return () => {
    clockSubscribers.delete(onChange);
    if (clockSubscribers.size === 0 && clockInterval) {
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const dateKey = now ? toApiDate(now, location.tzid) : "";

  useEffect(() => {
    if (!dateKey) return;

    let active = true;

    async function loadBoard() {
      const shabbatRequest = fetchShabbat(
        location.params,
        dateKey,
        location.tzid,
      ).catch(() => EMPTY_SHABBAT);

      try {
        const [board, shabbatInfo] = await Promise.all([
          fetchZmanim(dateKey, location.params, location.label),
          shabbatRequest,
        ]);
        if (!active) return;

        setStations(board.stations);
        setShabbat(shabbatInfo);
        setLocationTitle(board.locationTitle);
        setLoadError(null);
      } catch (error) {
        if (active) setLoadError(loadErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadBoard();

    return () => {
      active = false;
    };
  }, [dateKey, location, reloadKey]);

  function resetBoard() {
    setIsLoading(true);
    setLoadError(null);
    setStations([]);
    setShabbat(EMPTY_SHABBAT);
    setLocationTitle("");
  }

  function choosePreset(id: string) {
    const nextLocation = findPresetLocation(id);
    if (!nextLocation) return;

    setLocationError(null);
    resetBoard();
    saveLocation(nextLocation);
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setLocationError(
        "Geolocation is not supported by this browser.",
      );
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resetBoard();
        saveLocation(locationFromCoords(coords.latitude, coords.longitude));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied — choose a city from the list instead."
            : "Could not determine your location. Try again or pick a city.",
        );
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }

  const timeline = useMemo(() => {
    const shabbatRows = shabbatStations(shabbat);
    if (shabbatRows.length === 0) return stations;

    return [...stations, ...shabbatRows].sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );
  }, [stations, shabbat]);

  const nextStation = useMemo(() => {
    if (!now) return null;
    return (
      timeline.find((station) => station.time.getTime() > now.getTime()) ??
      null
    );
  }, [timeline, now]);

  const visibleStations = useMemo(() => {
    if (!now) return [];

    const cutoff = now.getTime() - 60 * 60_000;
    return timeline.filter((station) => station.time.getTime() >= cutoff);
  }, [timeline, now]);

  const isPreset = ALL_PRESET_LOCATIONS.some(
    (preset) => preset.id === location.id,
  );
  const locationName = locationTitle || location.label;
  const boardSummary = loadError
    ? "Unavailable"
    : isLoading
      ? "Updating…"
      : `${visibleStations.length} ${
          visibleStations.length === 1 ? "time" : "times"
        }`;

  return (
    <div className="zt-app" lang="en" dir="ltr">
      <TransitHeader
        location={locationName}
        nextStation={nextStation}
        parasha={shabbat.parasha}
        timeZone={location.tzid}
        loading={isLoading}
        error={Boolean(loadError)}
      />

      <div className="zt-content">
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
                onChange={(event) => choosePreset(event.target.value)}
              >
                {isCurrentLocation(location) && (
                  <option value="current">Current location</option>
                )}
                {!isCurrentLocation(location) && !isPreset && (
                  <option value={location.id}>{location.label}</option>
                )}
                {PRESET_LOCATIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.locations.map((preset: ZmanimLocation) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
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
            onClick={locateMe}
            disabled={isLocating}
          >
            <FiNavigation aria-hidden="true" />
            {isLocating ? "Locating…" : "Use my location"}
          </button>

          {locationError && (
            <p className="zt-geo-error" role="alert">
              {locationError}
            </p>
          )}
        </div>

        <section
          className="zt-board-panel"
          aria-labelledby="zt-today"
          aria-busy={isLoading}
        >
          <header className="zt-board-head">
            <div>
              <p className="zt-eyebrow">Departure board</p>
              <h2 id="zt-today" className="zt-section">
                Today&apos;s Zmanim
              </h2>
            </div>
            <p className="zt-board-summary" aria-live="polite">
              {boardSummary}
            </p>
          </header>

          {loadError ? (
            <div className="zt-error" role="alert">
              <strong>Couldn&apos;t reach Hebcal</strong>
              <small>{loadError}</small>
              <button
                className="zt-retry"
                onClick={() => {
                  setIsLoading(true);
                  setLoadError(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                Try again
              </button>
            </div>
          ) : isLoading && timeline.length === 0 ? (
            <div className="zt-skeletons" aria-hidden="true">
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
              <div className="zt-skeleton" />
            </div>
          ) : visibleStations.length === 0 ? (
            <div className="zt-empty" role="status">
              All of today&apos;s zmanim have passed. Tomorrow&apos;s times
              arrive at midnight.
            </div>
          ) : (
            <TimelineStation
              stations={visibleStations}
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
          <p>
            Halachic times vary by community — verify with your local
            calendar.
          </p>
        </footer>
      </div>
    </div>
  );
}
