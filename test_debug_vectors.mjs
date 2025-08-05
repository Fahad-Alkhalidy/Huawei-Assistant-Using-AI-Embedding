// Debug script for vector system
console.log("🔍 Debugging Vector System...");

async function debugVectorSystem() {
  try {
    // Test 1: Check environment variables
    console.log("1️⃣ Testing environment variables...");
    const envResponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    console.log("Chat API Status:", envResponse.status);

    // Test 2: Try vector stats with error details
    console.log("\n2️⃣ Testing vector stats...");
    try {
      const statsResponse = await fetch(
        "http://localhost:3000/api/manage-vectors"
      );
      const statsText = await statsResponse.text();
      console.log("Vector Stats Response:", statsText);
    } catch (error) {
      console.log("Vector Stats Error:", error.message);
    }

    // Test 3: Try to generate embeddings
    console.log("\n3️⃣ Testing embedding generation...");
    try {
      const generateResponse = await fetch(
        "http://localhost:3000/api/manage-vectors",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate" }),
        }
      );
      const generateText = await generateResponse.text();
      console.log("Generate Response:", generateText);
    } catch (error) {
      console.log("Generate Error:", error.message);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugVectorSystem();
