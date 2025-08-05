export class GroqClient {
  private apiKey: string;
  private baseUrl: string = "https://api.groq.com/openai/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || "";
  }

  async generate(
    prompt: string,
    model: string = "llama3-8b-8192"
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      console.error("Groq API error:", error);
      throw new Error("Failed to generate response from Groq");
    }
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    model: string = "llama3-8b-8192"
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response generated";
    } catch (error) {
      console.error("Groq API error:", error);
      throw new Error("Failed to generate chat response from Groq");
    }
  }
}
