import { NextRequest, NextResponse } from "next/server";
import { vectorSearchEngine } from "@/lib/vectorSearch";

export async function GET() {
  try {
    const stats = await vectorSearchEngine.getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Failed to get vector stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get vector stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "generate":
        const count = await vectorSearchEngine.generateAndStoreEmbeddings();
        return NextResponse.json({
          success: true,
          message: `Generated and stored ${count} embeddings in Pinecone`,
        });

      case "clear":
        await vectorSearchEngine.clearAllVectors();
        return NextResponse.json({
          success: true,
          message: "All vectors cleared from Pinecone",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Failed to manage vectors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to manage vectors" },
      { status: 500 }
    );
  }
}
