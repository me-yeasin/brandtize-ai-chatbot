import { SearchQuery, SearchResult, WebSearchData } from "@/models/search";

export class SearchService {
  private static apiKey = process.env.SEARCH_API_KEY || "";

  static async searchWeb(query: string): Promise<WebSearchData> {
    try {
      // Check if the query is a request to browse a specific website
      const specificWebsiteMatch = query.match(
        /(?:browse|visit|check|fetch|get|search|get data from|data from|information from|content from|read|view|go to)\s+(?:the\s+)?(?:website|webpage|page|site|url|link)?\s*(?:at|from|on|of|:)?\s*(?:https?:\/\/)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/\S*)?)/i
      );

      // Alternative pattern to catch domain.com without http
      const domainMatch = query.match(
        /(?:browse|visit|check|fetch|get|search|get data from|data from|information from|content from|read|view|go to)\s+(?:the\s+)?(?:website|webpage|page|site|url|link)?\s*(?:at|from|on|of|:)?\s*([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/\S*)?)/i
      );

      let websiteUrl = null;

      if (specificWebsiteMatch && specificWebsiteMatch[1]) {
        websiteUrl = specificWebsiteMatch[1];
        if (!websiteUrl.startsWith("http")) {
          websiteUrl = "https://" + websiteUrl;
        }

        console.log(
          "SearchService: Detected specific website request for:",
          websiteUrl
        );
        console.log("SearchService: Original query:", query);
        return await this.fetchSpecificWebsite(websiteUrl, query);
      } else if (domainMatch && domainMatch[1]) {
        websiteUrl = domainMatch[1];
        if (!websiteUrl.startsWith("http")) {
          websiteUrl = "https://" + websiteUrl;
        }

        console.log("SearchService: Detected domain in query:", websiteUrl);
        console.log("SearchService: Original query:", query);
        return await this.fetchSpecificWebsite(websiteUrl, query);
      }

      // Generate search queries based on the user's input
      const searchQueries = this.generateSearchQueries(query);

      // Store all search results
      const allResults: SearchResult[] = [];
      const allQueries: SearchQuery[] = [];

      // Execute each search query
      for (const searchQuery of searchQueries) {
        const queryObj: SearchQuery = {
          id: crypto.randomUUID(), // Generate a unique ID for each query
          query: searchQuery,
          timestamp: new Date().toISOString(),
        };
        allQueries.push(queryObj);

        // In a production implementation, you'd use a search API like this:
        /*
        const url = new URL('https://serpapi.com/search');
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('q', searchQuery);
        url.searchParams.append('engine', 'google');
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Search API error: ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.organic_results || [];
        const searchResults = results.slice(0, 3).map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          source: 'Web Search',
          timestamp: new Date().toISOString()
        }));
        
        allResults.push(...searchResults);
        */

        // For demo purposes without an API key, we'll use mock data
        const mockResults = this.getMockSearchResults(searchQuery);
        allResults.push(...mockResults);
      }

      return {
        queries: allQueries,
        results: allResults,
      };
    } catch (error) {
      console.error("Error searching the web:", error);
      return {
        queries: [],
        results: [],
      };
    }
  }

  // Generate multiple search queries based on the user's input
  private static generateSearchQueries(userQuery: string): string[] {
    // In a real implementation, you might use NLP to extract key questions
    // For now, we'll use a simple approach
    const baseQuery = userQuery.trim();

    if (baseQuery.length <= 10) {
      return [baseQuery];
    }

    // Generate 2-3 search queries based on the input
    const queries = [baseQuery];

    // Add a "latest" version if it's a factual question
    if (baseQuery.match(/what|when|who|how|why|is|are|can|could|will|would/i)) {
      queries.push(`${baseQuery} latest information`);
    }

    // Add a specific version if it contains certain keywords
    if (baseQuery.match(/compare|difference|versus|vs|better|pros|cons/i)) {
      queries.push(`${baseQuery} comparison`);
    }

    return queries.slice(0, 3); // Limit to 3 queries
  }

  // New method to fetch content from a specific website
  private static async fetchSpecificWebsite(
    url: string,
    originalQuery: string
  ): Promise<WebSearchData> {
    try {
      const timestamp = new Date().toISOString();
      const queryObj: SearchQuery = {
        id: crypto.randomUUID(),
        query: `Fetching data from: ${url}`,
        timestamp,
      };

      // In a real implementation, you would fetch the actual website content
      // For now, we'll create mock results based on the URL and query
      let results: SearchResult[] = [];

      // Extract domain name for more targeted mocking
      const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
      const domain = domainMatch ? domainMatch[1] : url;

      console.log("SearchService: Generating mock data for domain:", domain);

      // Generate different mock results based on known domains
      if (domain.includes("github.com")) {
        results = [
          {
            title: `GitHub - Open Source Projects`,
            link: url,
            snippet: `GitHub is where over 100 million developers shape the future of software. Contribute to open source projects, manage Git repositories, and collaborate with others.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `GitHub Repositories - ${
              url.split("/").pop() || "Search Results"
            }`,
            link: `${url}?tab=repositories`,
            snippet: `Find repositories related to your search on GitHub. Access code, documentation, and project details. GitHub is home to over 420 million repositories.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `GitHub Docs - Using Git and GitHub`,
            link: `${url}/docs`,
            snippet: `Learn how to use Git and GitHub for version control, collaboration, and code management. Find guides for beginners and advanced users alike.`,
            source: "Direct Website Fetch",
            timestamp,
          },
        ];
      } else if (domain.includes("wikipedia.org")) {
        const topic = originalQuery
          .replace(
            /.*?(about|on|for|wikipedia|wiki|information)\s+([^.?!]+)[.?!]?.*/i,
            "$2"
          )
          .trim();
        results = [
          {
            title: `${topic} - Wikipedia, the free encyclopedia`,
            link: url,
            snippet: `${topic} refers to ${
              topic.toLowerCase().startsWith("the") ? topic : "the " + topic
            } that has been documented extensively. Wikipedia provides comprehensive information about its history, development, and significance.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `History of ${topic} - Wikipedia`,
            link: `${url}#History`,
            snippet: `The history of ${topic} dates back to its origins and covers its evolution over time. This section includes key milestones, important figures, and significant events related to ${topic}.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `References and Further Reading - Wikipedia`,
            link: `${url}#References`,
            snippet: `Comprehensive list of sources and citations related to ${topic}. Includes academic papers, books, articles, and other reliable sources for further research.`,
            source: "Direct Website Fetch",
            timestamp,
          },
        ];
      } else {
        // Generic website content simulation
        results = [
          {
            title: `${domain} - Main Content`,
            link: url,
            snippet: `This webpage contains information about ${originalQuery
              .replace(
                /browse|visit|check|fetch|get|search|website|webpage|page|site|url|link|at|from|on|of|data|information|content|read|view|go to/gi,
                ""
              )
              .trim()}. The content includes comprehensive details, facts, and related information that would be relevant to your query.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `${domain} - About Section`,
            link: `${url}/about`,
            snippet: `${domain} is a website that specializes in providing information about topics related to your query. The site contains various resources, articles, and data that can help answer questions about ${originalQuery
              .replace(
                /browse|visit|check|fetch|get|search|website|webpage|page|site|url|link|at|from|on|of|data|information|content|read|view|go to/gi,
                ""
              )
              .trim()}.`,
            source: "Direct Website Fetch",
            timestamp,
          },
          {
            title: `${domain} - Related Information`,
            link: `${url}/info`,
            snippet: `Additional information related to your query about ${originalQuery
              .replace(
                /browse|visit|check|fetch|get|search|website|webpage|page|site|url|link|at|from|on|of|data|information|content|read|view|go to/gi,
                ""
              )
              .trim()}. This section contains specific details, statistics, and explanations that directly address your question.`,
            source: "Direct Website Fetch",
            timestamp,
          },
        ];
      }

      console.log("SearchService: Generated mock results:", results.length);

      return {
        queries: [queryObj],
        results,
      };
    } catch (error) {
      console.error("Error fetching specific website:", error);
      return {
        queries: [
          {
            id: crypto.randomUUID(),
            query: `Failed to fetch data from: ${url}`,
            timestamp: new Date().toISOString(),
          },
        ],
        results: [],
      };
    }
  }

  // Mock search results for demonstration
  private static getMockSearchResults(query: string): SearchResult[] {
    const timestamp = new Date().toISOString();

    // Generate different mock results based on the query
    if (query.includes("latest")) {
      return [
        {
          title: `Latest information about ${query.replace(
            " latest information",
            ""
          )}`,
          link: `https://example.com/latest-info`,
          snippet: `The most up-to-date information about ${query.replace(
            " latest information",
            ""
          )} shows significant developments in recent months.`,
          source: "Example News",
          timestamp,
        },
        {
          title: `Recent updates on ${query.replace(
            " latest information",
            ""
          )}`,
          link: `https://example.com/recent-updates`,
          snippet: `According to recent research, there have been several breakthroughs in understanding ${query.replace(
            " latest information",
            ""
          )}.`,
          source: "Research Journal",
          timestamp,
        },
      ];
    }

    if (query.includes("comparison")) {
      return [
        {
          title: `Comparing ${query.replace(" comparison", "")}`,
          link: `https://example.com/comparison`,
          snippet: `A detailed analysis comparing the key aspects of ${query.replace(
            " comparison",
            ""
          )}.`,
          source: "Comparison Site",
          timestamp,
        },
      ];
    }

    // Default results
    return [
      {
        title: `Information about ${query}`,
        link: `https://example.com/info/${encodeURIComponent(query)}`,
        snippet: `Comprehensive information about ${query} with detailed explanations and examples.`,
        source: "Example Encyclopedia",
        timestamp,
      },
      {
        title: `${query} - Wikipedia`,
        link: `https://example.com/wiki/${encodeURIComponent(query)}`,
        snippet: `${query} refers to a concept that has evolved significantly over time. The term was first coined in...`,
        source: "Example Wikipedia",
        timestamp,
      },
      {
        title: `How to understand ${query}`,
        link: `https://example.com/how-to/${encodeURIComponent(query)}`,
        snippet: `A step-by-step guide to understanding ${query} for beginners and advanced learners alike.`,
        source: "Example Tutorial Site",
        timestamp,
      },
    ];
  }
}
