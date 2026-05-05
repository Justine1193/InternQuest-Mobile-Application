import { readFile } from "node:fs/promises";

const ENDPOINT = "http://127.0.0.1:7577/ingest/05a3466c-8120-43eb-aadd-8ec31a0533b6";
const SESSION_ID = "94ae5a";
const RUN_ID = "pre-fix";

async function sendLog(hypothesisId, location, message, data = {}) {
  // #region agent log
  await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      runId: RUN_ID,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

async function readJson(path) {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return { __error: error?.message || "unknown read/parse error" };
  }
}

const rootPkg = await readJson("./package.json");
const fePkg = await readJson("./frontend/package.json");

await sendLog(
  "H1_root_missing_build",
  "scripts/debug-build-check.mjs:38",
  "Root package scripts snapshot",
  {
    hasScripts: Boolean(rootPkg?.scripts),
    scriptKeys: Object.keys(rootPkg?.scripts || {}),
    hasBuildScript: typeof rootPkg?.scripts?.build === "string",
    buildScript: rootPkg?.scripts?.build || null,
  }
);

await sendLog(
  "H2_frontend_has_build",
  "scripts/debug-build-check.mjs:50",
  "Frontend package scripts snapshot",
  {
    hasScripts: Boolean(fePkg?.scripts),
    scriptKeys: Object.keys(fePkg?.scripts || {}),
    hasBuildScript: typeof fePkg?.scripts?.build === "string",
    buildScript: fePkg?.scripts?.build || null,
  }
);

await sendLog(
  "H3_pkg_readability",
  "scripts/debug-build-check.mjs:62",
  "Package read/parse status",
  {
    rootReadError: rootPkg?.__error || null,
    frontendReadError: fePkg?.__error || null,
  }
);
