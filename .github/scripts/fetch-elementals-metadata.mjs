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
);

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Token ID lists (null = unrevealed tokens)
const TOKEN_IDS = {
  bamboo: [6217, 4006, 12644, 4952, 4889, 8355, 10709, 12273, null],
  character: [null, 10152, 17732, 12472, 14767, 12870, 1425, 8985, 14473],
  dots: [null, 19181, 14668, null, 16221, 19520, 1597, 18209, 723],
};

const METADATA_BASE_URL = "https://elementals-metadata.azuki.com/elemental";

async function fetchTokenMetadata(tokenId) {
  if (tokenId === null) {
    return null;
  }

  const url = `${METADATA_BASE_URL}/${tokenId}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    console.log(`✅ Fetched metadata for token ${tokenId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch token ${tokenId}:`, error.message);
    return null;
  }
}

async function fetchSuitMetadata(tokenIds, tileSuit) {
  console.log(`🔄 Fetching ${tileSuit} suit metadata...`);

  const results = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const tileNumber = i + 1;

    const baseItem = {
      tokenId,
      tileSuit,
      tileNumber,
    };

    if (tokenId === null) {
      results.push(baseItem);
      console.log(`⚪ Skipped unrevealed tile: ${tileSuit} ${tileNumber}`);
    } else {
      const metadata = await fetchTokenMetadata(tokenId);
      results.push({
        ...baseItem,
        ...(metadata || {}),
      });
    }
  }

  console.log(`✅ Completed ${tileSuit} suit (${results.length} tiles)`);
  return results;
}

async function saveMetadataFile(data, filename) {
  const filePath = path.join(outputDir, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to save ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting elementals metadata fetch...");

  try {
    // Fetch all suits concurrently for better performance
    const [bamboo, character, dots] = await Promise.all([
      fetchSuitMetadata(TOKEN_IDS.bamboo, "bamboo"),
      fetchSuitMetadata(TOKEN_IDS.character, "character"),
      fetchSuitMetadata(TOKEN_IDS.dots, "dots"),
    ]);

    // Save all files
    await Promise.all([
      saveMetadataFile(bamboo, "bamboo-bjmc-elementals-metadata.json"),
      saveMetadataFile(character, "character-bjmc-elementals-metadata.json"),
      saveMetadataFile(dots, "dots-bjmc-elementals-metadata.json"),
    ]);

    console.log("🎉 All metadata files saved successfully!");
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

main();
