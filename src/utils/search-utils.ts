
const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";
// Note: In a production environment, these keys should be stored securely
const API_KEY = "YOUR_GOOGLE_API_KEY"; // Placeholder
const SEARCH_ENGINE_ID = "YOUR_SEARCH_ENGINE_ID"; // Placeholder

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
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
      snippet: item.snippet
    }));
    
  } catch (error) {
    console.error("Error searching Google:", error);
    return "I encountered an error while searching for information. This may be due to API limits or configuration issues.";
  }
}

export function formatSearchResults(results: SearchResult[] | string): string {
  if (typeof results === "string") {
    return results;
  }
  
  let formattedResponse = "Based on web search results:\n\n";
  
  results.forEach((result, index) => {
    formattedResponse += `${index + 1}. ${result.title}\n${result.snippet}\n\n`;
  });
  
  formattedResponse += "Note: This information was compiled from search results and may not be complete or entirely accurate.";
  
  return formattedResponse;
}
