import { Client, type QueryDataSourceResponse } from '@notionhq/client';
import { isFullPage} from "@notionhq/client/build/src/helpers.js";
import { mapToNotionBookClipping } from "./notion-mapper.js";
import type { NotionBookClipping } from "../models/notion-book-clipping.model.js"

const apiKey = process.env.NOTION_API_KEY;
if (!apiKey) throw new Error("NOTION_API_KEY is not set.");

const dataSourceId = process.env.NOTION_DATABASE_ID;
if (!dataSourceId) throw new Error("NOTION_DATABASE_ID is not set.");

const notion = new Client({ auth: apiKey });

export async function getAllBookClippings(): Promise<NotionBookClipping[]>
{
  // Get pages
  const pages: QueryDataSourceResponse = await notion.dataSources.query({
    data_source_id: dataSourceId!,
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

