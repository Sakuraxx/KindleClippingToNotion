import type { Book, ComparisonResult } from "../models/comparison.model.js";

export function compareBooks(notionBooks: Book[], kindleBooks: Book[]): ComparisonResult {
  const result: ComparisonResult = {
    newBooks: [],
    updatedBooks: [],
  };
  
  const getBookKey = (book: Book) => `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;

  const notionBookMap = new Map<string, Book>();
  for (const book of notionBooks) {
    notionBookMap.set(getBookKey(book), book);
  }

  for(const kindleBook of kindleBooks) {
    const key = getBookKey(kindleBook);
    const notionBook = notionBookMap.get(key);
    if(!notionBook) {
      result.newBooks.push(kindleBook);
      continue;
    }

    const existingClippings = new Set(notionBook.clippings);
    const newClippings = kindleBook.clippings.filter(clip => !existingClippings.has(clip));
    if(newClippings.length > 0) {
      result.updatedBooks.push({
        title: kindleBook.title,
        author: kindleBook.author,
        clippings: newClippings
      });
    }
  }

  return result;
}
