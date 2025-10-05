import { getAllBookClippings } from "./services/notion-service.js";
import type { NotionBookClipping } from "./models/notion-clipping.model.js";
import { parseKindleClippings } from './services/kindle-parser.js';
import type { KindleClipping } from "./models/kindle-clipping.model.js";
import { compareBooks } from "./services/comparison-service.js";
import type { Book } from "./models/comparison.model.js";
import { adaptNotionBooksToStandardBooks } from "./services/notion-adapter.js";
import { adaptKindleClippingsToBooks } from "./services/kindle-adapter.js";

async function main() {
  try {
      const apiKey = process.env.NOTION_API_KEY;
      const dataSourceId = process.env.NOTION_DATABASE_ID;
      if (!apiKey || !dataSourceId) {
          throw new Error("API Key or DataSource ID is not configured.");
      }
      const notionClippings: NotionBookClipping[] = await getAllBookClippings(apiKey, dataSourceId);
      const kindleClippings: KindleClipping[] = await parseKindleClippings('My Clippings.txt');

      const notionBooks: Book[] = adaptNotionBooksToStandardBooks(notionClippings);
      const kindleBooks: Book[] = adaptKindleClippingsToBooks(kindleClippings);

      const comparisonResult = compareBooks(notionBooks, kindleBooks);

      console.log("New Books to Add:");
      comparisonResult.newBooks.forEach(book => {
          console.log(`- ${book.title} by ${book.author} (${book.clippings.length} clippings)`);
      });
      console.log("Books with Updated Clippings:");
      comparisonResult.updatedBooks.forEach(book => {
          console.log(`- ${book.title} by ${book.author} (${book.clippings.length} new clippings)`);
      });

  } catch (error) {
      console.error("An error occurred:", error);
  }
}

main();