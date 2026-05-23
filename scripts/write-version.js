const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function safeExec(cmd, fallback) {
  try {
    return execSync(cmd).toString().trim();
  } catch {
    return fallback;
  }
}

const commitHash = safeExec("git rev-parse --short HEAD", "unknown");
const commitHashFull = safeExec("git rev-parse HEAD", "unknown");
const buildDate = new Date().toISOString();

const versionInfo = {
  commitHash,
  commitHashFull,
  buildDate,
  appVersion: "1.0.0",
};

const outputPath = path.join(__dirname, "..", "assets", "version.json");
fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

console.log("[version] gravado:", versionInfo);