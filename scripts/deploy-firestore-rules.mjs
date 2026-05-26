/**
 * Local-only: reads VITE_FIREBASE_PROJECT_ID from .env and deploys Firestore rules.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

let projectId;
try {
  const env = parseEnvFile(readFileSync(envPath, "utf8"));
  projectId = env.VITE_FIREBASE_PROJECT_ID;
} catch (err) {
  if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
    console.error(
      `Missing ${envPath} — copy .env.example and set VITE_FIREBASE_PROJECT_ID.`
    );
    process.exit(1);
  }
  throw err;
}

if (!projectId) {
  console.error("VITE_FIREBASE_PROJECT_ID is not set in .env");
  process.exit(1);
}

console.log(`Deploying Firestore rules to project: ${projectId}`);

const result = spawnSync(
  "firebase",
  ["deploy", "--only", "firestore:rules", "--project", projectId],
  { stdio: "inherit", cwd: root, shell: process.platform === "win32" }
);

process.exit(result.status ?? 1);
