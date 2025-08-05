import { loadAllKnowledge, chunkKnowledge } from "./textLoader";
import { createEmbeddingClient, EmbeddingClient } from "./embeddingClient";
import { PineconeClient, PineconeRecord } from "./pineconeClient";

export type VectorSearchResult = {
  id: string;
  title: string;
  category: string;
  chunk: string;
  similarity: number;
  context?: string;
};

export class VectorSearchEngine {
  private embeddingClient: EmbeddingClient;
  private pineconeClient: PineconeClient;
  private isInitialized: boolean = false;

  constructor() {
    const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.embeddingClient = createEmbeddingClient(huggingFaceApiKey);
    this.pineconeClient = new PineconeClient();
  }

  // Initialize the system
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.pineconeClient.initialize();
      this.isInitialized = true;
      console.log("✅ Vector search engine initialized");
    } catch (error) {
      console.error("Failed to initialize vector search engine:", error);
      throw error;
    }
  }

  // Generate embeddings and store in Pinecone
  async generateAndStoreEmbeddings() {
    try {
      await this.initialize();

      console.log("🔄 Generating embeddings for all knowledge chunks...");

      const knowledge = loadAllKnowledge();
      const chunks = chunkKnowledge(knowledge);

      // Prepare texts for embedding
      const texts = chunks.map(
        (chunk) => `${chunk.title} ${chunk.category} ${chunk.chunk}`
      );

      // Generate embeddings
      const embeddings = await this.embeddingClient.embedBatch(texts);

      // Prepare records for Pinecone
      const records: PineconeRecord[] = chunks.map((chunk, index) => ({
        id: `chunk_${chunk._id}`,
        values: embeddings[index],
        metadata: {
          title: chunk.title,
          category: chunk.category,
          chunk: chunk.chunk,
          context: chunk.context,
        },
      }));

      // Store in Pinecone
      await this.pineconeClient.upsertVectors(records);

      console.log(
        `✅ Generated and stored ${records.length} embeddings in Pinecone`
      );
      return records.length;
    } catch (error) {
      console.error("Failed to generate and store embeddings:", error);
      throw error;
    }
  }

  // Search using vector similarity
  async search(
    query: string,
    topK: number = 10
  ): Promise<VectorSearchResult[]> {
    try {
      await this.initialize();

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingClient.embed(query);

      // Search in Pinecone
      const matches = await this.pineconeClient.search(queryEmbedding, topK);

      // Convert matches to search results
      const results: VectorSearchResult[] = matches.map((match) => ({
        id: match.id,
        title: String(match.metadata?.title || ""),
        category: String(match.metadata?.category || ""),
        chunk: String(match.metadata?.chunk || ""),
        similarity: match.score || 0,
        context: match.metadata?.context
          ? String(match.metadata.context)
          : undefined,
      }));

      return results;
    } catch (error) {
      console.error("Failed to perform vector search:", error);
      throw error;
    }
  }

  // Search with category filter
  async searchByCategory(
    query: string,
    category: string,
    topK: number = 10
  ): Promise<VectorSearchResult[]> {
    try {
      await this.initialize();

      const queryEmbedding = await this.embeddingClient.embed(query);

      // Search with category filter
      const matches = await this.pineconeClient.search(queryEmbedding, topK, {
        category: { $eq: category },
      });

      const results: VectorSearchResult[] = matches.map((match) => ({
        id: match.id,
        title: String(match.metadata?.title || ""),
        category: String(match.metadata?.category || ""),
        chunk: String(match.metadata?.chunk || ""),
        similarity: match.score || 0,
        context: match.metadata?.context
          ? String(match.metadata.context)
          : undefined,
      }));

      return results;
    } catch (error) {
      console.error("Failed to perform category search:", error);
      throw error;
    }
  }

  // Get Pinecone index statistics
  async getStats() {
    try {
      await this.initialize();
      const stats = await this.pineconeClient.getIndexStats();
      return stats;
    } catch (error) {
      console.error("Failed to get stats:", error);
      throw error;
    }
  }

  // Clear all vectors from Pinecone
  async clearAllVectors() {
    try {
      await this.initialize();
      await this.pineconeClient.deleteAllVectors();
    } catch (error) {
      console.error("Failed to clear vectors:", error);
      throw error;
    }
  }
}

// Create singleton instance
export const vectorSearchEngine = new VectorSearchEngine();

// Export the main search function
export async function vectorSearch(
  query: string,
  topK: number = 10
): Promise<VectorSearchResult[]> {
  return vectorSearchEngine.search(query, topK);
}
