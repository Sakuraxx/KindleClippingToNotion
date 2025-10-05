// index.ts
import { config } from "dotenv"
import { Client, type ListBlockChildrenResponse, type QueryDataSourceResponse } from '@notionhq/client';
import { isFullPage} from "@notionhq/client/build/src/helpers.js";
import { fillNotionBookClippingBlocks, mapToNotionBookClipping } from "./services/notion-mapper.js";
import type { NotionBookClipping } from "./models/notion-book-clipping.model.js";

config()

const apiKey = process.env.NOTION_API_KEY!!;
const dataSourceId = process.env.NOTION_DATABASE_ID!!;

const notion = new Client({ auth: apiKey });

async function queryDataRecords()
{
  const dsResp: QueryDataSourceResponse = await notion.dataSources.query({
    data_source_id: dataSourceId,
  });

  let nBookClippings: NotionBookClipping[] = [];

  for(const page of dsResp.results)
  {
    if(!isFullPage(page))
    {
      continue;
    }

    let nBookClipping: NotionBookClipping | null =  mapToNotionBookClipping(page);

    if(nBookClipping)
    {
      const blocksResp: ListBlockChildrenResponse = await notion.blocks.children.list({
        block_id: page.id
      });
      fillNotionBookClippingBlocks(nBookClipping, blocksResp);
    }

    if(nBookClipping)
    {
      nBookClippings.push(nBookClipping);
    }
  }

  nBookClippings.forEach(b => {console.log(b.title, b.blocks?.length)});
}

queryDataRecords();
