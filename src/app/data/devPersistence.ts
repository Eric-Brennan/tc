/**
 * DEV-ONLY mock-data persistence layer.
 *
 * Saves mutated mock arrays to localStorage so that changes
 * (e.g. accepting a connection, awarding pro-bono tokens)
 * survive the page reload triggered by the test-client switcher.
 *
 * -------------------------------------------------------
 * PRODUCTION REMOVAL GUIDE
 * 1. Delete this file.
 * 2. Remove the `hydrateMockData()` call at the bottom of mockData.ts.
 * 3. Remove every `persistMockData()` call across the codebase
 *    (search for "persistMockData" — should be ~10 call-sites).
 * 4. Remove the "Reset Test Data" button from MobileViewToggle.tsx.
 * -------------------------------------------------------
 */

const STORAGE_KEY = "besthelp_dev_mock_snapshot";

// ---- Date-aware JSON helpers ------------------------------------------------

function replacer(this: unknown, key: string, value: unknown): unknown {
  // JSON.stringify calls Date.toJSON() BEFORE the replacer, so `value`
  // is already an ISO string for Date fields.  Access the raw value via
  // `this[key]` to detect the original Date instance.
  const raw = (this as Record<string, unknown>)[key];
  if (raw instanceof Date) return { __date__: raw.toISOString() };
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "__date__" in (value as Record<string, unknown>)
  ) {
    return new Date((value as { __date__: string }).__date__);
  }
  // Fallback: catch bare ISO-8601 date strings that were persisted
  // before the replacer fix was in place.
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
  ) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

// ---- Snapshot / Hydrate -----------------------------------------------------

interface Snapshot {
  connections: unknown[];
  proBonoTokens: unknown[];
  messages: unknown[];
  sessionNotes: unknown[];
  courseBookings?: unknown[];
}

// Cached array references — set once during hydrateMockData(),
// then reused by persistMockData() to avoid circular imports.
let _connections: unknown[] | null = null;
let _proBonoTokens: unknown[] | null = null;
let _messages: unknown[] | null = null;
let _sessionNotes: unknown[] | null = null;
let _courseBookings: unknown[] | null = null;

/**
 * Persist current in-memory mock data to localStorage.
 * Call this after every mutation (push / status change / splice).
 */
export function persistMockData(): void {
  if (!_connections) return; // hydrate hasn't run yet

  const snapshot: Snapshot = {
    connections: _connections,
    proBonoTokens: _proBonoTokens!,
    messages: _messages!,
    sessionNotes: _sessionNotes!,
    courseBookings: _courseBookings!,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot, replacer));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

/**
 * Hydrate mock arrays from a previous snapshot stored in localStorage.
 * Must be called **once**, at the bottom of mockData.ts, after all
 * arrays have been initialised with their defaults.
 *
 * Pass in the actual array references so we can splice data in-place.
 */
export function hydrateMockData(
  connections: unknown[],
  proBonoTokens: unknown[],
  messages: unknown[],
  sessionNotes: unknown[],
  courseBookings: unknown[]
): void {
  // Cache references for persistMockData()
  _connections = connections;
  _proBonoTokens = proBonoTokens;
  _messages = messages;
  _sessionNotes = sessionNotes;
  _courseBookings = courseBookings;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const snapshot: Snapshot = JSON.parse(raw, reviver as (key: string, value: unknown) => unknown);

    if (snapshot.connections) {
      connections.length = 0;
      connections.push(...snapshot.connections);
    }
    if (snapshot.proBonoTokens) {
      proBonoTokens.length = 0;
      proBonoTokens.push(...snapshot.proBonoTokens);
    }
    if (snapshot.messages) {
      messages.length = 0;
      messages.push(...snapshot.messages);
    }
    if (snapshot.sessionNotes) {
      sessionNotes.length = 0;
      sessionNotes.push(...snapshot.sessionNotes);
    }
    if (snapshot.courseBookings) {
      courseBookings.length = 0;
      courseBookings.push(...snapshot.courseBookings);
    }
  } catch {
    // Corrupt data — ignore and let defaults stand.
  }
}

/**
 * Clear persisted mock data so the next reload starts fresh.
 */
export function resetMockData(): void {
  localStorage.removeItem(STORAGE_KEY);
}