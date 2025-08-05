import fs from "fs";
import path from "path";

export type KnowledgeEntry = {
  category: string; // e.g. "computing"
  title: string; // e.g. "HCIA Computing"
  content: string; // text content
};

export function loadAllKnowledge(): KnowledgeEntry[] {
  const knowledgeRoot = path.join(process.cwd(), "knowledge");
  const categories = fs
    .readdirSync(knowledgeRoot)
    .filter((name) =>
      fs.statSync(path.join(knowledgeRoot, name)).isDirectory()
    );

  const entries: KnowledgeEntry[] = [];

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

export type KnowledgeChunk = {
  _id: number;
  category: string;
  title: string;
  chunk: string;
  chunkIndex: number;
  context?: string; // Additional context for the chunk
};

// Recursive chunking with semantic preservation
export function chunkKnowledge(
  entries: KnowledgeEntry[],
  maxChunkSize = 500,
  overlapSize = 100
): KnowledgeChunk[] {
  let id = 0;
  const chunks: KnowledgeChunk[] = [];

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
  content: string,
  title: string,
  category: string,
  maxChunkSize: number,
  overlapSize: number,
  startId: number
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
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
  section: string,
  title: string,
  category: string,
  maxChunkSize: number,
  overlapSize: number,
  startId: number,
  chunkIndex: number
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
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
  text: string,
  title: string,
  category: string,
  maxChunkSize: number,
  overlapSize: number,
  startId: number,
  chunkIndex: number
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
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

function splitIntoSentences(text: string): string[] {
  // Split by sentence endings while preserving abbreviations
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [text];
}

function getOverlapWords(text: string, overlapSize: number): string {
  const words = text.split(/\s+/);
  if (words.length <= 3) return text; // Keep entire text if too short

  const overlapWordCount = Math.floor(overlapSize / 5); // Approximate 5 chars per word
  const startIndex = Math.max(0, words.length - overlapWordCount);
  return words.slice(startIndex).join(" ");
}

function getContext(
  sections: string[],
  currentIndex: number,
  title: string
): string {
  const contextParts: string[] = [];

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
