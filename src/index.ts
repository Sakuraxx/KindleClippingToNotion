import { getAllBookClippings } from "./services/notion-service.js";
import type { NotionBookClipping } from "./models/notion-clipping.model.js";

async function main() {
  console.log("Fetching book clippings from Notion...");
  try {

      const apiKey = process.env.NOTION_API_KEY;
      const dataSourceId = process.env.NOTION_DATABASE_ID;

      if (!apiKey || !dataSourceId) {
          throw new Error("API Key or DataSource ID is not configured.");
      }

      const clippings: NotionBookClipping[] = await getAllBookClippings(apiKey, dataSourceId);

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