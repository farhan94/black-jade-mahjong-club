import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const outputDir = path.join(
  projectRoot,
  "public",
  "data",
  "elementals-metadata"
); // CHANGED: now in public/

const dataDir = path.join(projectRoot, "public", "data"); // CHANGED: now in public/
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Token ID lists (with nulls for unrevealed, order matches constants)
const bambooTokenIds = [
  6217,
  4006,
  12644,
  4952,
  4889,
  8355,
  10709,
  12273,
  null,
];
const characterTokenIds = [
  null,
  10152,
  17732,
  12472,
  14767,
  12870,
  1425,
  8985,
  14473,
];
const dotsTokenIds = [null, 19181, 14668, null, 16221, 19520, 1597, 18209, 723];

async function fetchAndCollect(tokenIds, tileSuit) {
  const results = [];
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    if (tokenId === null) {
      results.push({
        tokenId: null,
        tileSuit,
        tileNumber: i + 1,
      });
      continue;
    }
    const url = `https://elementals-metadata.azuki.com/elemental/${tokenId}`;
    try {
      const response = await axios.get(url);
      results.push({
        tokenId,
        tileSuit,
        tileNumber: i + 1,
        ...response.data,
      });
      console.log(`Fetched metadata for tokenId ${tokenId}`);
    } catch (err) {
      console.error(`Failed to fetch tokenId ${tokenId}:`, err.message);
      results.push({
        tokenId,
        tileSuit,
        tileNumber: i + 1,
      });
    }
  }
  return results;
}

(async () => {
  const bamboo = await fetchAndCollect(bambooTokenIds, "bamboo");
  const character = await fetchAndCollect(characterTokenIds, "character");
  const dots = await fetchAndCollect(dotsTokenIds, "dots");

  try {
    const bambooPath = path.join(
      outputDir,
      "bamboo-bjmc-elementals-metadata.json"
    );
    const characterPath = path.join(
      outputDir,
      "character-bjmc-elementals-metadata.json"
    );
    const dotsPath = path.join(outputDir, "dots-bjmc-elementals-metadata.json");
    fs.writeFileSync(bambooPath, JSON.stringify(bamboo, null, 2));
    fs.writeFileSync(characterPath, JSON.stringify(character, null, 2));
    fs.writeFileSync(dotsPath, JSON.stringify(dots, null, 2));
    console.log("Saved all metadata files.");
  } catch (err) {
    console.error("[ERROR] Failed to write metadata files:", err);
    process.exit(1);
  }
})();
