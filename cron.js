/**
 * PingRelay CRON
 *
 * Usage: add to crontab (every minute)
 *   * * * * * cd /path/to/pingrelay && node cron.js >> /var/log/pingrelay-cron.log 2>&1
 */

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// Load .env from web/
const envPath = path.join(__dirname, "web", ".env");
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const idx = trimmed.indexOf("=");
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    });
}

const BASE_URL = env.NEXTAUTH_URL || "http://localhost:3000";
const CRON_SECRET = env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error("[CRON] CRON_SECRET not found in web/.env");
  process.exit(1);
}

const SITEMAP_LOCK = path.join(__dirname, ".sitemap-last-run");

async function sendMessages() {
  try {
    const res = await fetch(`${BASE_URL}/api/send-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(`[${new Date().toISOString()}] send-messages: ${res.status}`, JSON.stringify(data));
  } catch (err) {
    console.error(`[${new Date().toISOString()}] send-messages error:`, err.message);
  }
}

function shouldRunSitemap() {
  try {
    if (!fs.existsSync(SITEMAP_LOCK)) return true;
    const lastRun = parseInt(fs.readFileSync(SITEMAP_LOCK, "utf-8"), 10);
    const hoursSince = (Date.now() - lastRun) / (1000 * 60 * 60);
    return hoursSince >= 24;
  } catch {
    return true;
  }
}

function generateSitemap() {
  try {
    console.log(`[${new Date().toISOString()}] sitemap: generating...`);
    execSync("npx next-sitemap", { cwd: path.join(__dirname, "web"), stdio: "pipe" });
    fs.writeFileSync(SITEMAP_LOCK, String(Date.now()));
    console.log(`[${new Date().toISOString()}] sitemap: done`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] sitemap error:`, err.message);
  }
}

async function main() {
  await sendMessages();

  if (shouldRunSitemap()) {
    generateSitemap();
  }
}

main();
