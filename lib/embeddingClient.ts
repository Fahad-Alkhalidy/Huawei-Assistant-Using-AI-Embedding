import { HfInference } from "@huggingface/inference";

export type EmbeddingClient = {
  embed: (text: string) => Promise<number[]>;
  embedBatch: (texts: string[]) => Promise<number[][]>;
};

// Hugging Face Embedding Client (Free)
export class HuggingFaceEmbeddingClient implements EmbeddingClient {
  private hf: HfInference;
  private model: string;

  constructor(
    apiKey?: string,
    model: string = "sentence-transformers/all-MiniLM-L6-v2"
  ) {
    this.hf = new HfInference(apiKey);
    this.model = model;
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.hf.featureExtraction({
        model: this.model,
        inputs: text,
      });
      return response as number[];
    } catch (error) {
      console.error("Hugging Face embedding error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.hf.featureExtraction({
        model: this.model,
        inputs: texts,
      });
      return response as number[][];
    } catch (error) {
      console.error("Hugging Face batch embedding error:", error);
      throw new Error("Failed to generate batch embeddings");
    }
  }
}

// Factory function to create embedding client
export function createEmbeddingClient(apiKey?: string): EmbeddingClient {
  return new HuggingFaceEmbeddingClient(apiKey);
}
