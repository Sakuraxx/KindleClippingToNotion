# Kindle Clippings to Notion
A simple command-line tool to automatically import your Kindle clippings from My Clippings.txt into a Notion database. It syncs your highlights, only adding new books and new clippings into the existing books.

## Setup
### Notion Setup:
* Create a Notion Integration and get the Internal Integration Token.
* Create a Notion Database with two properties: `Title` (Type: Title) and `Author` (Type: Rich Text).
* Get the Database ID from the database URL.
* Share the database with your integration.
### Project Setup:
* Clone this repository.
* Install dependencies: npm install
* Create a `.env` file in the project root and add your keys:
```env
NOTION_API_KEY="your_notion_api_key"
NOTION_DATABASE_ID="your_database_id"
```
## How to Run
* Place your My Clippings.txt file in the project root directory.
* Run the script from your terminal:
```bash
npm start
```