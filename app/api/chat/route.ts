import { NextRequest, NextResponse } from "next/server";
import { simpleSearch } from "@/lib/smartSearch";
import { AIClient } from "@/lib/aiClient";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use vector search to get multiple relevant chunks
    const searchResults = await simpleSearch(message, 8);

    if (searchResults.length === 0) {
      return NextResponse.json({
        response:
          "I couldn't find any relevant information about that topic in my Huawei certification knowledge base. Please try asking about a different Huawei certification or technology.",
        context: "No relevant information found",
      });
    }

    // Extract relevant context from all search results
    const context = searchResults
      .map(
        (result, index) =>
          `[Chunk ${index + 1}] ${result.title} (${result.category}):\n${
            result.chunk
          }`
      )
      .join("\n\n");

    // Try to get AI response using free model, but fall back to keyword search if AI fails
    try {
      // Create the prompt for AI
      const prompt = `You are a helpful assistant specializing in Huawei certifications and technologies. 
      
Context from Huawei certification materials (multiple relevant chunks):
${context}

User question: ${message}

Please provide a comprehensive and accurate response based on ALL the Huawei certification materials provided in the context. 
Combine information from multiple chunks when relevant to give a complete answer.
If the context doesn't contain enough information to answer the question, you can provide general guidance about Huawei certifications, but make sure to mention that you're providing general information.

Keep your response comprehensive, professional, and focused on Huawei technologies and certifications. Use information from multiple chunks when it helps provide a better answer.`;

      // Get AI provider from environment or default to ollama
      const aiProvider = process.env.AI_PROVIDER as "groq";
      const aiClient = new AIClient(aiProvider);

      const response = await aiClient.generate(prompt);

      return NextResponse.json({
        response: response,
        context: `Found ${searchResults.length} relevant chunks from knowledge base (using ${aiProvider})`,
        searchResults: searchResults.map((r) => ({
          title: r.title,
          category: r.category,
          relevance: r.relevance,
          chunkPreview: r.chunk.substring(0, 150) + "...",
        })),
      });
    } catch (aiError) {
      console.log(
        `AI (${
          process.env.AI_PROVIDER || "groq"
        }) failed, falling back to keyword search:`,
        aiError
      );

      // Fall back to comprehensive keyword-based response
      let response = `Based on my Huawei certification knowledge base, here's what I found:\n\n`;

      // Show all relevant chunks with their relevance scores
      searchResults.forEach((result, index) => {
        response += `**${index + 1}. ${result.title}** (${
          result.category
        }) - Relevance: ${result.relevance}\n\n`;
        response += `${result.chunk}\n\n`;

        // Add context if available
        if (result.context) {
          response += `*Context: ${result.context}*\n\n`;
        }

        response += `---\n\n`;
      });

      // Add summary if there are multiple results
      if (searchResults.length > 1) {
        response += `**Summary:** I found ${searchResults.length} relevant pieces of information from the Huawei certification knowledge base. The results are ordered by relevance to your query.`;
      }

      return NextResponse.json({
        response: response,
        context: `Found ${searchResults.length} relevant info (AI unavailable, using comprehensive keyword search)`,
        searchResults: searchResults.map((r) => ({
          title: r.title,
          category: r.category,
          relevance: r.relevance,
          chunkPreview: r.chunk.substring(0, 150) + "...",
        })),
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
