import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import ELEMENTALS_ABI from "../../src/constants/elementals-abi.json" assert { type: "json" };

const ELEMENTALS_CONTRACT_ADDRESS =
  "0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bambooFile = path.join(
  path.resolve(__dirname, "..", ".."),
  "data",
  "elementals-metadata",
  "bamboo-bjmc-elementals-metadata.json"
);
const characterFile = path.join(
  path.resolve(__dirname, "..", ".."),
  "data",
  "elementals-metadata",
  "character-bjmc-elementals-metadata.json"
);
const dotsFile = path.join(
  path.resolve(__dirname, "..", ".."),
  "data",
  "elementals-metadata",
  "dots-bjmc-elementals-metadata.json"
);

const files = [
  { file: bambooFile, name: "bamboo" },
  { file: characterFile, name: "character" },
  { file: dotsFile, name: "dots" },
];

const alchemyApiKey = process.env.ALCHEMY_API_KEY;
let contract = null;

async function getOwner(tokenId) {
  let attempts = 0;
  let lastError = null;
  while (attempts < 5) {
    try {
      return await contract.ownerOf(tokenId);
    } catch (err) {
      lastError = err;
      // Always retry up to 5 times, regardless of error type
      const delay = 1000 * (attempts + 1); // Increase backoff with each attempt
      console.warn(
        `Retrying getOwner of tokenId ${tokenId} after ${delay}ms due to: ${
          err && err.message ? err.message : err
        }`
      );
      await new Promise((res) => setTimeout(res, delay));
      attempts++;
      continue;
    }
  }
  console.error(
    `Failed to fetch owner for tokenId ${tokenId} after retries:`,
    lastError?.message || lastError
  );
  return null;
}

async function addOwnersToFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const arr = JSON.parse(fileContent);

  for (const item of arr) {
    if (!item.tokenId) {
      item.owner = null;
      continue;
    }
    item.owner = await getOwner(item.tokenId);
  }
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
  console.log(`Updated owners in ${filePath}`);
}

const main = async () => {
  if (!alchemyApiKey) {
    console.error(
      "No Alchemy API key found in environment variable ALCHEMY_API_KEY. Exiting."
    );
    process.exit(1);
  }
  const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
  const provider = new ethers.JsonRpcProvider(alchemyUrl);
  contract = new ethers.Contract(
    ELEMENTALS_CONTRACT_ADDRESS,
    ELEMENTALS_ABI,
    provider
  );

  for (const { file } of files) {
    try {
      await addOwnersToFile(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
};

main();
