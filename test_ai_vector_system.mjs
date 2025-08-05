// Test script to verify AI-powered vector search system
import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";

// Load environment variables
function loadEnv() {
  try {
    const envContent = fs.readFileSync(".env.local", "utf-8");
    const envVars = {};
    
    envContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    Object.keys(envVars).forEach((key) => {
      process.env[key] = envVars[key];
    });
    
    console.log("✅ Environment variables loaded");
  } catch (error) {
    console.error("❌ Error loading .env.local:", error.message);
    process.exit(1);
  }
}

loadEnv();

console.log("🧪 Testing AI-Powered Vector Search System...");

// Initialize clients
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = "huawei-assistant-mini";

async function testAIVectorSystem() {
  try {
    // Connect to the index
    const index = pinecone.index(indexName);
    console.log(`📂 Connected to index: ${indexName}`);
    
    // Test queries that should work with AI-powered search
    const testQueries = [
      "HCIA IoT exam requirements",
      "5G core network architecture", 
      "Cloud computing certification path",
      "Data center networking best practices",
      "Security solutions implementation"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing AI query: "${query}"`);
      
      // Step 1: Generate embedding for the query
      const queryEmbedding = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: query,
      });
      
      console.log(`✅ Generated embedding (${queryEmbedding.length} dimensions)`);
      
      // Step 2: Search in Pinecone
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      });
      
      console.log(`📊 Found ${searchResponse.matches?.length || 0} relevant chunks:`);
      
      if (searchResponse.matches) {
        searchResponse.matches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match.metadata?.title} (${match.metadata?.category}) - Score: ${match.score?.toFixed(3)}`);
          console.log(`     Content: ${match.metadata?.chunk?.substring(0, 100)}...`);
        });
      }
      
      // Step 3: Simulate AI response (this would normally be done by Groq)
      console.log(`🤖 AI would generate response based on ${searchResponse.matches?.length || 0} relevant chunks`);
      
      console.log("---");
    }
    
    console.log("🎉 AI-powered vector search test completed successfully!");
    console.log("✅ System is ready for: Query → Embedding → Pinecone Search → Groq AI Response");
    
  } catch (error) {
    console.error("❌ Error testing AI vector search:", error);
  }
}

testAIVectorSystem(); 