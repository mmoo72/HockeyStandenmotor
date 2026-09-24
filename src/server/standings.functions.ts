import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";

const BASE = "https://app.hockeyweerelt.nl";

type DeviceCreds = { uuid: string; token: string; expires: number };
let cachedDevice: DeviceCreds | null = null;

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function configuredDevice(): DeviceCreds | null {
  const token = process.env.HAPI_AUTHORIZATION;
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const { uuid } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { uuid?: string };
    if (!uuid) throw new Error("JWT payload has no uuid");
    return { uuid, token, expires: Number.POSITIVE_INFINITY };
  } catch {
    throw new Error("HAPI_AUTHORIZATION must be a valid HAPI JWT");
  }
}

function sanitizePath(p: string): string {
  return p.replace(/[^a-zA-Z0-9\-/]+/g, "");
}

async function getDevice(): Promise<DeviceCreds> {
  const now = Date.now();
  const configured = configuredDevice();
  if (configured) return configured;
  if (cachedDevice && cachedDevice.expires > now) return cachedDevice;
  const uuid = crypto.randomUUID();
  const res = await fetch(`${BASE}/device/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ uuid, os: "Web" }),
  });
  if (!res.ok) throw new Error(`device/register failed: ${res.status}`);
  const data = (await res.json()) as { token: string };
  // Cache for 24h; if token rejected later we'll re-register.
  cachedDevice = { uuid, token: data.token, expires: now + 24 * 60 * 60 * 1000 };
  return cachedDevice;
}

// --- Throttle: one request every 10 seconds ---
const REQUEST_INTERVAL_MS = 10_000;
let nextRequestAt = 0;

async function throttleSlot(): Promise<void> {
  const now = Date.now();
  const requestAt = Math.max(now, nextRequestAt);
  nextRequestAt = requestAt + REQUEST_INTERVAL_MS;
  const waitMs = requestAt - now;
  if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
}

async function hapiFetch(path: string, retry = true): Promise<unknown> {
  await throttleSlot();
  const device = await getDevice();
  const ts = Math.floor(Date.now() / 1000).toString();
  const sanitized = sanitizePath(path);
  const reversedUuid = device.uuid.split("").reverse().join("");
  const signature = await sha1Hex(`${ts}${sanitized}${reversedUuid}`);
  // Debug: log the path, sanitized path and signature to help debug mismatches
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[hapiFetch] path=%s sanitized=%s ts=%s sig=%s', path, sanitized, ts, signature);
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-HAPI-Authorization": device.token,
        "X-HAPI-Timestamp": ts,
        "X-HAPI-Signature": signature,
        "X-HAPI-Version": "7",
      },
    });
  } catch (err) {
    console.error("[hapiFetch] request failed", {
      url: `${BASE}${path}`,
      path,
      sanitized,
      ts,
      error: err,
    });
    throw err;
  }
  console.log( res.status )
  if (res.status == 401 && retry) {
    cachedDevice = null;
    return hapiFetch(path, false);
  }
  if (res.status == 429 && retry) {
    console.error("timeout 429 response status=%s body=%s", res.status );
    await new Promise((r) => setTimeout(r, 3000));
    return hapiFetch(path, false);
  }

  if (!res.ok) {

    // Read a clone so the original response remains available to callers.
    const responseBody = await res.clone().text();
    console.error("[hapiFetch] response status=%s body=%s", res.status, responseBody);

    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export type StandingRow = {
  rank: number;
  change: "up" | "down" | "equal" | string;
  rank_change: number;
  played: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  team: { id: number; name: string; short_name?: string; logo?: string };
};

export type PouleMatchTeam = {
  id: number;
  name: string;
  short_name?: string;
  logo?: string;
};

export type PouleMatch = {
  id: number;
  date: string;
  status: string;
  poule_name?: string;
  home: PouleMatchTeam;
  away: PouleMatchTeam;
  score: { home: number; away: number };
  shootouts: { home: number; away: number };
  location: {
    facility: { name: string; address?: string };
    field: { name: string; type?: string };
  };
  round: number;
};

export type PouleStandings = {
  pouleId: number;
  name: string;
  competition: { name: string; poule_name?: string; class_name?: string };
  standings: StandingRow[];
  matches: PouleMatch[];
};

export type PouleResult =
  | { ok: true; data: PouleStandings }
  | { ok: false; pouleId: number; error: string };

type PouleApiResponse = {
  data: {
    id: number
    name: string
    competition: {
      id: number
      name: string
      class_name: string
      poule_name: string
      poules?: {
        id: number
        name: string
        competition: {
          name: string
          class_name: string
          poule_name: string
        }
      }[]
    }
    standings: StandingRow[]
    matches?: PouleMatch[]
  }
}

// In-memory result cache (server-side, shared across requests in same instance)
const RESULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const resultCache = new Map<number, { expires: number; result: PouleResult }>();
const inflight = new Map<number, Promise<PouleResult>>();
const pouleDataDir = path.resolve(process.cwd(), "data", "poules");

function pouleFilePath(pouleId: number): string {
  if (!Number.isInteger(pouleId) || pouleId < 0) {
    throw new Error("Invalid poule id");
  }
  return path.join(pouleDataDir, `${pouleId}.json`);
}

async function readPouleFile(pouleId: number): Promise<PouleResult | null> {
  try {
    const file = await readFile(pouleFilePath(pouleId), "utf8");
    const result = JSON.parse(file) as PouleResult;
    return result.ok && result.data.pouleId === pouleId ? result : null;
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
    if (code !== "ENOENT") console.error("[readPouleFile] failed", { pouleId, error: err });
    return null;
  }
}

async function writePouleFile(result: Extract<PouleResult, { ok: true }>): Promise<void> {
  await mkdir(pouleDataDir, { recursive: true });
  await writeFile(pouleFilePath(result.data.pouleId), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

async function fetchPoule(pouleId: number): Promise<PouleResult> {
  try {
    const json = (await hapiFetch(`/poules/${pouleId}`)) as PouleApiResponse;
    const p = json.data;
    const matchingPoule = p.competition.poules?.find(
      (inner) => inner.id === p.id
    );

    return {
      ok: true,
      data: {
        pouleId: p.id,  // 173366
        name: p.name,  // poule A
       
        competition: {
          name: p.competition.name,   // eerste klasse dames
          class_name: matchingPoule?.competition.class_name ?? p.competition.class_name,
          poule_name: matchingPoule?.competition.poule_name ?? p.competition.poule_name,
        },
        standings: p.standings ?? [],
        matches: p.matches ?? [],
      },
    };
  } catch (err) {
    console.error("[fetchPoule] failed", { pouleId, error: err });
    return {
      ok: false,
      pouleId,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const getPouleStandings = createServerFn({ method: "GET" })
  .inputValidator((data: { pouleId: number; force?: boolean }) => data)
  .handler(async ({ data }): Promise<PouleResult> => {
    const now = Date.now();
    if (!data.force) {
      const stored = await readPouleFile(data.pouleId);
      if (stored) {
        resultCache.set(data.pouleId, { expires: now + RESULT_TTL_MS, result: stored });
        return stored;
      }
    }
    let promise = inflight.get(data.pouleId);
    if (!promise) {
      promise = fetchPoule(data.pouleId).then((result) => {
        // Only cache successful results; on failure keep prior cache if any
        if (result.ok) {
          resultCache.set(data.pouleId, { expires: Date.now() + RESULT_TTL_MS, result });
          void writePouleFile(result).catch((err) => {
            console.error("[writePouleFile] failed", { pouleId: data.pouleId, error: err });
          });
        } else {
          const prev = resultCache.get(data.pouleId);
          if (prev) return prev.result;
        }
        return result;
      }).finally(() => {
        inflight.delete(data.pouleId);
      });
      inflight.set(data.pouleId, promise);
    }
    return promise;
  });