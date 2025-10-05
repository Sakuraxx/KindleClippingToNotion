import { appendNotionBlocksToExistingBooks, createNotionPagesForNewBooks, getAllBookClippings as getAllNotionBookClippings } from "./services/notion-service.js";
import type { NotionBookClipping as NotionBookClipping } from "./models/notion-clipping.model.js";
import { parseKindleClippings } from './services/kindle-parser.js';
import type { KindleClipping } from "./models/kindle-clipping.model.js";
import { compareBooks } from "./services/comparison-service.js";
import type { Book } from "./models/comparison.model.js";
import { adaptNotionBooksToStandardBooks } from "./services/notion-adapter.js";
import { adaptKindleClippingsToBooks } from "./services/kindle-adapter.js";

async function main() {
  try {
      const apiKey = process.env.NOTION_API_KEY;
      const dataSourceId = process.env.NOTION_SOURCE_ID;
      if (!apiKey || !dataSourceId) {
          throw new Error("API Key or DataSource ID is not configured.");
      }
      const notionClippings: NotionBookClipping[] = await getAllNotionBookClippings(apiKey, dataSourceId);
      const kindleClippings: KindleClipping[] = await parseKindleClippings('My Clippings.txt');

      const notionBooks: Book[] = adaptNotionBooksToStandardBooks(notionClippings);
      const kindleBooks: Book[] = adaptKindleClippingsToBooks(kindleClippings);

      const comparisonResult = compareBooks(notionBooks, kindleBooks);

      console.log("New Books to Add:");
      if(comparisonResult.newBooks.length === 0) {
          console.log("- None");
      }
      comparisonResult.newBooks.forEach(book => {
          console.log(`- ${book.title} by ${book.author} (${book.clippings.length} clippings)`);
      });
      console.log("Books with Updated Clippings:");
      if(comparisonResult.updatedBooks.length === 0) {
          console.log("- None");
      }
      comparisonResult.updatedBooks.forEach(book => {
          console.log(`- ${book.title} by ${book.author} (${book.clippings.length} new clippings)`);
      });

      await createNotionPagesForNewBooks(apiKey, dataSourceId, comparisonResult.newBooks);
      await appendNotionBlocksToExistingBooks(apiKey, comparisonResult.updatedBooks);

  } catch (error) {
      console.error("An error occurred:", error);
  }
}

main();