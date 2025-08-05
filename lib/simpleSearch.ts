import { vectorSearch, VectorSearchResult } from "./vectorSearch";

export type SearchResult = {
  id: number;
  title: string;
  category: string;
  chunk: string;
  relevance: number;
  context?: string;
};

// Use vector search only - no fallback to simple search
export async function simpleSearch(
  query: string,
  topK: number = 10
): Promise<SearchResult[]> {
  try {
    const vectorResults = await vectorSearch(query, topK);

    // Convert vector results to search results
    return vectorResults.map((result) => ({
      id: parseInt(result.id.replace("chunk_", "")),
      title: result.title,
      category: result.category,
      chunk: result.chunk,
      relevance: result.similarity * 100, // Convert similarity to relevance score
      context: result.context,
    }));
  } catch (error) {
    console.error("Vector search failed:", error);
    throw new Error(
      "Vector search is required. Please ensure Pinecone is properly configured."
    );
  }
}
