export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  timestamp: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: string;
}

export interface WebSearchData {
  queries: SearchQuery[];
  results: SearchResult[];
}
