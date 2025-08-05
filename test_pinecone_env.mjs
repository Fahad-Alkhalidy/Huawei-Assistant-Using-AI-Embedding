// Test different Pinecone environment formats
console.log("🔍 Testing Pinecone Environment Formats...");

const environments = [
  "us-east-1-aws",
  "us-east-1-gcp",
  "us-west-1-gcp",
  "us-east-1",
  "gcp-starter",
];

async function testEnvironments() {
  for (const env of environments) {
    console.log(`\nTesting environment: ${env}`);

    // Simulate the environment variable
    process.env.PINECONE_ENVIRONMENT = env;

    try {
      const response = await fetch("http://localhost:3003/api/manage-vectors");
      const data = await response.text();
      console.log(`✅ ${env}: ${data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${env}: ${error.message}`);
    }
  }
}

testEnvironments();
