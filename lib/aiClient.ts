import { GroqClient } from "./groqClient";

export type AIProvider = "ollama" | "huggingface" | "groq" | "openai";

export class AIClient {
  private provider: AIProvider;
  private groqClient?: GroqClient;

  constructor(provider: AIProvider = "ollama") {
    this.provider = provider;
    this.groqClient = new GroqClient();
  }

  async generate(prompt: string, model?: string): Promise<string> {
    try {
      if (!this.groqClient) throw new Error("Groq client not initialized");
      return await this.groqClient.generate(prompt, model || "llama3-8b-8192");
    } catch (error) {
      console.error(`AI Client error (${this.provider}):`, error);
      throw new Error(`Failed to generate response from ${this.provider}`);
    }
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    model?: string
  ): Promise<string> {
    try {
      if (!this.groqClient) throw new Error("Groq client not initialized");
      return await this.groqClient.chat(messages, model || "llama3-8b-8192");
    } catch (error) {
      console.error(`AI Client error (${this.provider}):`, error);
      throw new Error(`Failed to generate chat response from ${this.provider}`);
    }
  }

  getProvider(): AIProvider {
    return this.provider;
  }
}
