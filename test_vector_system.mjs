// Test script for vector search system
console.log("🧪 Testing Vector Search System...");

async function testVectorSystem() {
  try {
    // Test 1: Check vector stats
    console.log("1️⃣ Checking vector stats...");
    const statsResponse = await fetch(
      "http://localhost:3001/api/manage-vectors"
    );
    const statsData = await statsResponse.json();
    console.log("Vector stats:", statsData);

    // Test 2: Generate embeddings
    console.log("\n2️⃣ Generating embeddings...");
    const generateResponse = await fetch(
      "http://localhost:3001/api/manage-vectors",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      }
    );
    const generateData = await generateResponse.json();
    console.log("Generate result:", generateData);

    // Test 3: Search with vector search
    console.log("\n3️⃣ Testing vector search...");
    const searchResponse = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "HCIA IoT exam" }),
    });
    const searchData = await searchResponse.json();
    console.log(
      `Found ${
        searchData.searchResults?.length || 0
      } results with vector search`
    );

    // Test 4: Check updated stats
    console.log("\n4️⃣ Checking updated stats...");
    const updatedStatsResponse = await fetch(
      "http://localhost:3001/api/manage-vectors"
    );
    const updatedStatsData = await updatedStatsResponse.json();
    console.log("Updated vector stats:", updatedStatsData);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testVectorSystem();
