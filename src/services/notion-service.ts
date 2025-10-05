import { Client, type BlockObjectRequest, type CreatePageParameters, type QueryDataSourceResponse } from '@notionhq/client';
import { isFullPage} from "@notionhq/client/build/src/helpers.js";
import { mapToNotionBookClipping } from "./notion-mapper.js";
import type { NotionBookClipping } from "../models/notion-clipping.model.js"
import type { Book } from '../models/comparison.model.js';

export async function getAllBookClippings(apiKey: string, dataSourceId: string): Promise<NotionBookClipping[]>
{
  const notion = new Client({ auth: apiKey });

  // Get pages
  const pages: QueryDataSourceResponse = await notion.dataSources.query({
    data_source_id: dataSourceId,
  });
  const fullPages = pages.results.filter(isFullPage);

  // Create promises
  const clippingPromises = fullPages.map(async (page) => {
    const blockResp = await notion.blocks.children.list({
      block_id: page.id,
    });
    
    return mapToNotionBookClipping(page, blockResp);
  });

  const clippings = await Promise.all(clippingPromises);

  return clippings.filter((c): c is NotionBookClipping => c !== null);
}

export async function createPageForBook(apiKey: string, datasourceId: string, book: Book) {
  const pageProperties: CreatePageParameters["properties"] = {
    'Title': {
      type: 'title',
      title: [{ type: 'text', text: { content: book.title } }],
    },
    'Author': {
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: book.author } }],
    },
  };

  const createPageParams: CreatePageParameters = {
    parent: {
      type: "data_source_id",
      data_source_id: datasourceId,
    },
    properties: pageProperties
  };

  const notion = new Client({ auth: apiKey });
  const createdPageResp = await notion.pages.create(createPageParams);
  book.id = createdPageResp.id;
  await appendBlocksToPage(notion, book);
  return createdPageResp;
}

async function appendBlocksToPage(notion: Client, book: Book) {
  for (let i = 0; i < book.clippings.length; i += 100) {
    const batch: BlockObjectRequest[] = book.clippings.slice(i, i + 100).map(clipping => ({
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{
          type: 'text', text: { content: clipping }
        }]
      }
    }));
    await notion.blocks.children.append({
      block_id: book.id!,
      children: batch,
    });
  }
}

export async function createNotionPagesForNewBooks(apiKey: string, datasourceId: string, newBooks: Book[])
{
  if (newBooks.length === 0) {
    console.log("No new books to create.");
    return;
  }

  for (const book of newBooks) {
    try {
        await createPageForBook(apiKey, datasourceId, book);
    } catch (error: any) {
        console.error(`  > Failed to create page for "${book.title}". Error: ${error.message}`);
    }
  }
  console.log("Finished creating new pages.");
}
