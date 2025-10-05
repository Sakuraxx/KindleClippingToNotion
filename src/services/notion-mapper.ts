// notion-mapper.ts
import { isFullBlock } from '@notionhq/client';
import { isTextRichTextItemResponse } from "@notionhq/client/build/src/helpers.js";
import type { PageObjectResponse, ListBlockChildrenResponse } from '@notionhq/client';
import type { NotionBookClipping } from '../models/notion-book-clipping.model.js';

export function mapToNotionBookClipping(page: PageObjectResponse): NotionBookClipping | null {
  const titleProp = page.properties["Title"]
  const title = (titleProp?.type == "title" && titleProp.title[0]?.plain_text) || "Untitled"
  return {
    id: page.id,
    title,
    blocks: null
  }
}

export function fillNotionBookClippingBlocks(nbClipping: NotionBookClipping, blocksResp: ListBlockChildrenResponse)
{
    for(const block of blocksResp.results)
    {
      if(!isFullBlock(block))
      {
        continue;
      }

      // Only filter quote 
      if(block.type == "quote")
      {
        const richText = block.quote.rich_text[0]!;
        if(isTextRichTextItemResponse(richText))
        {
          if(nbClipping.blocks)
          {
            nbClipping.blocks.push({id: block.id, content: richText.plain_text})
          }
          else
          {
            nbClipping.blocks = [{id: block.id, content: richText.plain_text}]
          }
        }
      }
    }
}