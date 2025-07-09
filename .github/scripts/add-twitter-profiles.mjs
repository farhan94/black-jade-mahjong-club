import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

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

const AZUKI_BASE_URL = "https://www.azuki.com/collector";
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY = 1000;
const REQUEST_DELAY = 1000; // 1 second delay between requests

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Cache-Control": "max-age=0",
  Referer: "https://www.azuki.com/",
};

const BLACKLISTED_HANDLES = ["azukiofficial", "twitter", "null", "undefined"];

// Cache to avoid fetching the same owner multiple times
const ownerTwitterCache = new Map();

function isValidTwitterHandle(handle) {
  return (
    handle &&
    typeof handle === "string" &&
    handle.length >= 1 &&
    handle.length <= 15 &&
    /^[a-zA-Z0-9_]+$/.test(handle) &&
    !BLACKLISTED_HANDLES.includes(handle.toLowerCase())
  );
}

async function fetchTwitterProfileFromAzuki(ownerAddress) {
  if (!ownerAddress) {
    return null;
  }

  // Check cache first
  if (ownerTwitterCache.has(ownerAddress)) {
    return ownerTwitterCache.get(ownerAddress);
  }

  const collectorUrl = `${AZUKI_BASE_URL}/${ownerAddress}`;
  console.log(`🔄 Fetching Twitter profile for: ${ownerAddress}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(collectorUrl, {
        headers: BROWSER_HEADERS,
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      if (response.status !== 200) {
        console.log(
          `⚠️  Non-200 status ${response.status} for ${ownerAddress}`
        );
        ownerTwitterCache.set(ownerAddress, null);
        return null;
      }

      const html = response.data;

      if (!html || html.length < 100) {
        console.log(`⚠️  Empty/short response for ${ownerAddress}`);
        ownerTwitterCache.set(ownerAddress, null);
        return null;
      }

      // Extract Twitter handle from JSON data
      const twitterNameMatch = html.match(/"twitterName"\s*:\s*"([^"]+)"/);

      let result = null;

      if (twitterNameMatch && twitterNameMatch[1]) {
        const handle = twitterNameMatch[1];

        if (isValidTwitterHandle(handle)) {
          result = {
            handle,
            url: `https://twitter.com/${handle}`,
          };
          console.log(`✅ Found Twitter profile: @${handle}`);
        } else {
          console.log(`⚠️  Invalid handle rejected: "${handle}"`);
        }
      }

      // Cache the result (even if null)
      ownerTwitterCache.set(ownerAddress, result);

      if (!result) {
        console.log(`❌ No Twitter profile found for ${ownerAddress}`);
      }

      return result;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(
          `❌ Failed to fetch ${ownerAddress} after ${MAX_RETRIES} attempts:`,
          error.message
        );
        ownerTwitterCache.set(ownerAddress, null);
        return null;
      }

      const delay = BASE_RETRY_DELAY * attempt;
      console.warn(
        `⚠️  Retry ${attempt}/${MAX_RETRIES} for ${ownerAddress} in ${delay}ms: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
}

async function addTwitterProfilesToMetadata(filePath, suitName) {
  console.log(`🔄 Processing ${suitName} metadata...`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const metadata = JSON.parse(fileContent);

    // Get unique owners to avoid duplicate requests
    const uniqueOwners = new Set();
    metadata.forEach((item) => {
      if (item.owner) {
        uniqueOwners.add(item.owner);
      }
    });

    console.log(`📊 Found ${uniqueOwners.size} unique owners in ${suitName}`);

    let processed = 0;
    let successful = 0;

    for (const item of metadata) {
      if (!item.owner) {
        item.ownerTwitter = null;
        continue;
      }

      // Check if we need to process this owner
      if (!ownerTwitterCache.has(item.owner)) {
        processed++;
        console.log(
          `[${processed}/${uniqueOwners.size}] Processing: ${item.owner}`
        );

        // Rate limiting: respectful delay between requests
        if (processed > 1) {
          console.log(`⏳ Waiting 1s...`);
          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));
        }
      }

      const twitterProfile = await fetchTwitterProfileFromAzuki(item.owner);
      item.ownerTwitter = twitterProfile;

      if (twitterProfile) {
        successful++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    console.log(
      `✅ Updated ${suitName}: ${successful}/${metadata.length} profiles found`
    );
  } catch (error) {
    console.error(`❌ Error processing ${suitName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting Twitter profile collection...");

  try {
    for (const { path: filePath, name: suitName } of METADATA_FILES) {
      await addTwitterProfilesToMetadata(filePath, suitName);
    }

    console.log("🎉 Twitter profile collection completed!");
    console.log(
      `📊 Cache summary: ${ownerTwitterCache.size} unique owners processed`
    );
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

main();
