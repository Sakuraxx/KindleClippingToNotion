export interface NotionBookClipping
{
  id: string, // page id
  title: string,
  blocks: NotionBlockWrapper[] | null
}

export interface NotionBlockWrapper
{
  id: string, // block id
  content: string // plain text
}