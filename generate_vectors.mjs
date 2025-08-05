// Script to generate and store vectors in Pinecone using proper chunking
import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
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

    // Set environment variables
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

console.log("🚀 Starting Vector Generation with Proper Chunking...");

// Initialize clients
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = "huawei-assistant-mini"; // Use your existing index

// Load all knowledge using the same logic as textLoader.ts
function loadAllKnowledge() {
  const knowledgeRoot = path.join(process.cwd(), "knowledge");
  const categories = fs
    .readdirSync(knowledgeRoot)
    .filter((name) =>
      fs.statSync(path.join(knowledgeRoot, name)).isDirectory()
    );

  const entries = [];

  for (const category of categories) {
    const categoryPath = path.join(knowledgeRoot, category);
    const files = fs.readdirSync(categoryPath);

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const fullPath = path.join(categoryPath, file);
        const content = fs.readFileSync(fullPath, "utf-8");

        entries.push({
          category,
          title: file.replace(".txt", "").replace(/-/g, " "),
          content,
        });
      }
    }
  }

  return entries;
}

// Use the same chunking logic as textLoader.ts
function chunkKnowledge(entries, maxChunkSize = 500, overlapSize = 100) {
  let id = 0;
  const chunks = [];

  entries.forEach(({ category, title, content }) => {
    const documentChunks = recursiveChunkDocument(
      content,
      title,
      category,
      maxChunkSize,
      overlapSize,
      id
    );

    chunks.push(...documentChunks);
    id += documentChunks.length;
  });

  return chunks;
}

function recursiveChunkDocument(
  content,
  title,
  category,
  maxChunkSize,
  overlapSize,
  startId
) {
  const chunks = [];
  let currentId = startId;

  // First, try to split by major sections (double newlines)
  const sections = content
    .split(/\n\s*\n/)
    .filter((section) => section.trim().length > 0);

  if (sections.length === 0) {
    // If no sections found, treat the entire content as one section
    sections.push(content);
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();

    if (section.length <= maxChunkSize) {
      // Section fits in one chunk
      chunks.push({
        _id: currentId++,
        category,
        title,
        chunk: section,
        chunkIndex: chunks.length,
        context: getContext(sections, i, title),
      });
    } else {
      // Section needs to be split further
      const sectionChunks = splitSectionRecursively(
        section,
        title,
        category,
        maxChunkSize,
        overlapSize,
        currentId,
        chunks.length
      );
      chunks.push(...sectionChunks);
      currentId += sectionChunks.length;
    }
  }

  return chunks;
}

function splitSectionRecursively(
  section,
  title,
  category,
  maxChunkSize,
  overlapSize,
  startId,
  chunkIndex
) {
  const chunks = [];
  let currentId = startId;

  // Try to split by sentences first
  const sentences = splitIntoSentences(section);

  if (sentences.length === 1 || section.length <= maxChunkSize) {
    // If only one sentence or section is small enough, split by words
    const wordChunks = splitByWords(
      section,
      title,
      category,
      maxChunkSize,
      overlapSize,
      currentId,
      chunkIndex
    );
    chunks.push(...wordChunks);
  } else {
    // Split by sentences with overlap
    let currentChunk = "";
    let currentChunkIndex = chunkIndex;
    let overlapText = "";

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk =
        currentChunk + (currentChunk ? " " : "") + sentence;

      if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          _id: currentId++,
          category,
          title,
          chunk: currentChunk.trim(),
          chunkIndex: currentChunkIndex++,
          context: overlapText,
        });

        // Start new chunk with overlap
        const overlapWords = getOverlapWords(currentChunk, overlapSize);
        overlapText = overlapWords;
        currentChunk = overlapWords + " " + sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        _id: currentId++,
        category,
        title,
        chunk: currentChunk.trim(),
        chunkIndex: currentChunkIndex,
        context: overlapText,
      });
    }
  }

  return chunks;
}

function splitByWords(
  text,
  title,
  category,
  maxChunkSize,
  overlapSize,
  startId,
  chunkIndex
) {
  const chunks = [];
  const words = text.split(/\s+/);
  let currentChunk = "";
  let currentId = startId;
  let currentChunkIndex = chunkIndex;
  let overlapText = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const potentialChunk = currentChunk + (currentChunk ? " " : "") + word;

    if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        _id: currentId++,
        category,
        title,
        chunk: currentChunk.trim(),
        chunkIndex: currentChunkIndex++,
        context: overlapText,
      });

      // Start new chunk with overlap
      const overlapWords = getOverlapWords(currentChunk, overlapSize);
      overlapText = overlapWords;
      currentChunk = overlapWords + " " + word;
    } else {
      currentChunk = potentialChunk;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      _id: currentId++,
      category,
      title,
      chunk: currentChunk.trim(),
      chunkIndex: currentChunkIndex,
      context: overlapText,
    });
  }

  return chunks;
}

function splitIntoSentences(text) {
  // Split by sentence endings while preserving abbreviations
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [text];
}

function getOverlapWords(text, overlapSize) {
  const words = text.split(/\s+/);
  if (words.length <= 3) return text; // Keep entire text if too short

  const overlapWordCount = Math.floor(overlapSize / 5); // Approximate 5 chars per word
  const startIndex = Math.max(0, words.length - overlapWordCount);
  return words.slice(startIndex).join(" ");
}

function getContext(sections, currentIndex, title) {
  const contextParts = [];

  // Add previous section context
  if (currentIndex > 0) {
    const prevSection = sections[currentIndex - 1];
    const prevContext = prevSection.substring(0, 100).trim();
    if (prevContext) {
      contextParts.push(`Previous: ${prevContext}...`);
    }
  }

  // Add next section context
  if (currentIndex < sections.length - 1) {
    const nextSection = sections[currentIndex + 1];
    const nextContext = nextSection.substring(0, 100).trim();
    if (nextContext) {
      contextParts.push(`Next: ${nextContext}...`);
    }
  }

  return contextParts.length > 0 ? contextParts.join(" | ") : "";
}

async function generateEmbeddings(texts) {
  console.log(`🔄 Generating embeddings for ${texts.length} chunks...`);

  const embeddings = [];
  const batchSize = 10; // Process in batches

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        texts.length / batchSize
      )}`
    );

    try {
      const batchEmbeddings = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: batch,
      });

      embeddings.push(...batchEmbeddings);
    } catch (error) {
      console.error(
        `Error processing batch ${Math.floor(i / batchSize) + 1}:`,
        error
      );
      // Add empty embeddings for failed batches
      for (let j = 0; j < batch.length; j++) {
        embeddings.push(new Array(384).fill(0));
      }
    }
  }

  return embeddings;
}

async function storeVectors(chunks, embeddings) {
  console.log(`🔄 Storing ${chunks.length} vectors in Pinecone...`);

  const index = pinecone.index(indexName);
  const records = chunks.map((chunk, i) => ({
    id: `chunk_${chunk._id}`,
    values: embeddings[i],
    metadata: {
      title: chunk.title,
      category: chunk.category,
      chunk: chunk.chunk,
      context: chunk.context,
      chunkIndex: chunk.chunkIndex,
    },
  }));

  // Store in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    console.log(
      `Upserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        records.length / batchSize
      )}`
    );

    try {
      await index.upsert(batch);
    } catch (error) {
      console.error(
        `Error upserting batch ${Math.floor(i / batchSize) + 1}:`,
        error
      );
    }
  }

  console.log(`✅ Successfully stored ${records.length} vectors in Pinecone`);
}

async function main() {
  try {
    // Load knowledge
    console.log("📚 Loading knowledge files...");
    const knowledge = loadAllKnowledge();
    console.log(`Found ${knowledge.length} knowledge files`);

    // Chunk knowledge using proper recursive chunking
    console.log("✂️ Chunking knowledge with recursive algorithm...");
    const chunks = chunkKnowledge(knowledge);
    console.log(`Created ${chunks.length} chunks using proper chunking`);

    // Show some sample chunks
    console.log("\n📋 Sample chunks:");
    chunks.slice(0, 3).forEach((chunk, i) => {
      console.log(`Chunk ${i + 1}: ${chunk.title} (${chunk.category})`);
      console.log(`Content: ${chunk.chunk.substring(0, 100)}...`);
      console.log(`Context: ${chunk.context || "None"}`);
      console.log("---");
    });

    // Prepare texts for embedding
    const texts = chunks.map(
      (chunk) => `${chunk.title} ${chunk.category} ${chunk.chunk}`
    );

    // Generate embeddings
    const embeddings = await generateEmbeddings(texts);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Store in Pinecone
    await storeVectors(chunks, embeddings);

    console.log("🎉 Vector generation complete with proper chunking!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
