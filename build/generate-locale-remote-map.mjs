import fs from "node:fs";
import path from "node:path";

const [, , ...argv] = process.argv;

function getArg(name) {
  const prefix = `--${name}=`;
  const match = argv.find((item) => item.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

const distAssetsDir = getArg("dist-assets");
const outputFile = getArg("output");
const releaseAssetsDir = getArg("release-assets");
const cdnBase = getArg("cdn-base").replace(/\/+$/, "");
const filePattern = getArg("file-pattern");
const exportName = getArg("export-name") || "remoteLocaleMap";

if (!distAssetsDir || !outputFile || !releaseAssetsDir || !cdnBase) {
  console.error("Missing required arguments for generate-locale-remote-map.mjs");
  process.exit(1);
}

const localeChunkPattern = filePattern
  ? new RegExp(filePattern)
  : /^languages-(.+?)\.[^.]+\.chunk\.js$/;
const files = fs.readdirSync(distAssetsDir);
const localeEntries = [];

for (const file of files) {
  const match = file.match(localeChunkPattern);
  if (!match) {
    continue;
  }
  localeEntries.push([match[1], file]);
}

if (localeEntries.length === 0) {
  console.error(`No locale chunks found in ${distAssetsDir}`);
  process.exit(1);
}

fs.mkdirSync(releaseAssetsDir, { recursive: true });

for (const [, file] of localeEntries) {
  fs.copyFileSync(path.join(distAssetsDir, file), path.join(releaseAssetsDir, file));
}

localeEntries.sort(([left], [right]) => left.localeCompare(right));

const fileBody = [
  `export const ${exportName}: Record<string, string> = {`,
  ...localeEntries.map(([locale, file]) => `  "${locale}": "${cdnBase}/${file}",`),
  "};",
  ""
].join("\n");

fs.writeFileSync(outputFile, fileBody, "utf8");
