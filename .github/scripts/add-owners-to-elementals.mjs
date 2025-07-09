import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import ELEMENTALS_ABI from "../../src/constants/elementals-abi.json" assert { type: "json" };

const ELEMENTALS_CONTRACT_ADDRESS =
  "0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e";
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

const METADATA_FILES = [
  "bamboo-bjmc-elementals-metadata.json",
  "character-bjmc-elementals-metadata.json",
  "dots-bjmc-elementals-metadata.json",
].map((filename) => ({
  path: path.join(
    projectRoot,
    "public",
    "data",
    "elementals-metadata",
    filename
  ),
  name: filename.split("-")[0], // Extract suit name
}));

let contract = null;

async function initializeContract() {
  const alchemyApiKey = "FUtnAiHaahvsvuLCMHu8S";

  if (!alchemyApiKey) {
    throw new Error("ALCHEMY_API_KEY environment variable is required");
  }

  const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
  const provider = new ethers.JsonRpcProvider(alchemyUrl);

  contract = new ethers.Contract(
    ELEMENTALS_CONTRACT_ADDRESS,
    ELEMENTALS_ABI,
    provider
  );

  console.log("✅ Ethereum contract initialized");
}

async function getTokenOwner(tokenId) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      console.log(`✅ Token ${tokenId} owner: ${owner}`);
      return owner;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(
          `❌ Failed to fetch owner for token ${tokenId} after ${MAX_RETRIES} attempts:`,
          error.message
        );
        return null;
      }

      const delay = BASE_RETRY_DELAY * attempt;
      console.warn(
        `⚠️  Retry ${attempt}/${MAX_RETRIES} for token ${tokenId} in ${delay}ms: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
}

async function addOwnersToMetadata(filePath, suitName) {
  console.log(`🔄 Processing ${suitName} metadata...`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const metadata = JSON.parse(fileContent);

    let processedCount = 0;
    let ownerCount = 0;

    for (const item of metadata) {
      if (!item.tokenId) {
        item.owner = null;
        console.log(
          `⚪ Skipped unrevealed tile: ${suitName} ${item.tileNumber}`
        );
      } else {
        item.owner = await getTokenOwner(item.tokenId);
        if (item.owner) ownerCount++;
        processedCount++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    console.log(
      `✅ Updated ${suitName}: ${ownerCount}/${processedCount} owners found`
    );
  } catch (error) {
    console.error(`❌ Error processing ${suitName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting owner data collection...");

  try {
    await initializeContract();

    for (const { path: filePath, name: suitName } of METADATA_FILES) {
      await addOwnersToMetadata(filePath, suitName);
    }

    console.log("🎉 Owner data collection completed successfully!");
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

main();
