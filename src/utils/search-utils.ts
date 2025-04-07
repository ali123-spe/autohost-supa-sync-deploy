const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";
// Note: In a production environment, these keys should be stored securely
const API_KEY = "YOUR_GOOGLE_API_KEY"; // Placeholder
const SEARCH_ENGINE_ID = "YOUR_SEARCH_ENGINE_ID"; // Placeholder
const WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

export async function searchGoogle(query: string): Promise<SearchResult[] | string> {
  try {
    if (!API_KEY || API_KEY === "YOUR_GOOGLE_API_KEY" || !SEARCH_ENGINE_ID || SEARCH_ENGINE_ID === "YOUR_SEARCH_ENGINE_ID") {
      return "I need a valid Google API key and Search Engine ID to search the web. This is a demo version.";
    }

    const url = new URL(GOOGLE_SEARCH_API_URL);
    url.searchParams.append("key", API_KEY);
    url.searchParams.append("cx", SEARCH_ENGINE_ID);
    url.searchParams.append("q", query);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return `I couldn't find any information about "${query}".`;
    }
    
    return data.items.slice(0, 3).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: "Google"
    }));
    
  } catch (error) {
    console.error("Error searching Google:", error);
    return "I encountered an error while searching for information. This may be due to API limits or configuration issues.";
  }
}

export async function searchWikipedia(query: string): Promise<SearchResult[] | string> {
  try {
    // First, search for Wikipedia articles
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.append("action", "query");
    searchUrl.searchParams.append("list", "search");
    searchUrl.searchParams.append("srsearch", query);
    searchUrl.searchParams.append("format", "json");
    searchUrl.searchParams.append("origin", "*");
    
    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search API responded with status: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query.search || searchData.query.search.length === 0) {
      return `I couldn't find any Wikipedia articles about "${query}".`;
    }
    
    // Get the first result's title
    const topResult = searchData.query.search[0];
    
    // Get the summary for this article
    const summaryUrl = new URL(`${WIKIPEDIA_API_URL}${encodeURIComponent(topResult.title)}`);
    
    const summaryResponse = await fetch(summaryUrl.toString());
    
    if (!summaryResponse.ok) {
      throw new Error(`Wikipedia summary API responded with status: ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();
    
    return [{
      title: summaryData.title,
      link: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}`,
      snippet: summaryData.extract || topResult.snippet.replace(/<\/?span[^>]*>/g, ""),
      source: "Wikipedia"
    }];
    
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return "I encountered an error while searching Wikipedia. Please try again later.";
  }
}

export async function searchWeb(query: string): Promise<SearchResult[] | string> {
  try {
    // Try Wikipedia first
    const wikipediaResults = await searchWikipedia(query);
    
    // If Wikipedia returned an error message, try Google
    if (typeof wikipediaResults === "string") {
      return await searchGoogle(query);
    }
    
    // If Google API keys aren't set, just return Wikipedia results
    if (API_KEY === "YOUR_GOOGLE_API_KEY" || SEARCH_ENGINE_ID === "YOUR_SEARCH_ENGINE_ID") {
      return wikipediaResults;
    }
    
    // Otherwise, try to get Google results as well
    const googleResults = await searchGoogle(query);
    
    // If Google returned an error message, just return Wikipedia results
    if (typeof googleResults === "string") {
      return wikipediaResults;
    }
    
    // Combine the results
    return [...wikipediaResults, ...googleResults];
  } catch (error) {
    console.error("Error searching web:", error);
    return "I encountered an error while searching for information. Please try again later.";
  }
}

export function formatSearchResults(results: SearchResult[] | string): string {
  if (typeof results === "string") {
    return results;
  }
  
  let formattedResponse = "Based on web search results:\n\n";
  
  results.forEach((result, index) => {
    formattedResponse += `${index + 1}. ${result.title}${result.source ? ` (${result.source})` : ""}\n${result.snippet}\n\n`;
  });
  
  formattedResponse += "Note: This information was compiled from search results and may not be complete or entirely accurate.";
  
  return formattedResponse;
}
