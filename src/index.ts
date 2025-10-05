import { getAllBookClippings } from "./services/notion-service.js";
import type { NotionBookClipping } from "./models/notion-book-clipping.model.js";

async function main() {
  console.log("Fetching book clippings from Notion...");
  try {
      const clippings: NotionBookClipping[] = await getAllBookClippings();

      console.log(`Successfully fetched ${clippings.length} clippings.`);

      for (const clipping of clippings) {
          console.log(`\n--- ${clipping.title} ---`);
          console.log(`  (Found ${clipping.blocks.length} quotes)`);
      }
  } catch (error) {
      console.error("An error occurred:", error);
  }
}

main();