import { pipeline } from "@xenova/transformers";
import pg from "pg";
import fs from "fs/promises";
import path from "path";

// ---- Config ----
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!NEON_DATABASE_URL) {
  console.error("FATAL: NEON_DATABASE_URL environment variable is not set.");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: NEON_DATABASE_URL });

// ---- Helper Functions ----
async function getAllMarkdownFiles(rootDir) {
  const allFiles = [];
  async function findFilesRecursively(directory) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await findFilesRecursively(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
          allFiles.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${directory}: ${err.message}`);
    }
  }
  await findFilesRecursively(rootDir);
  return allFiles;
}

function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text || typeof text !== "string" || text.trim() === "") return [];
  if (chunkSize <= overlap) overlap = 0;
  const chunks = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
    if (startIndex >= text.length && endIndex === text.length) break;
  }
  return chunks.filter((chunk) => chunk.trim() !== "");
}

// ---- Main Logic ----
async function processSingleDocument(docPath, model) {
  console.log(`Processing document: ${docPath}`);
  try {
    const rawContent = await fs.readFile(docPath, "utf-8");
    const textChunks = chunkText(rawContent);
    if (textChunks.length === 0) {
      console.warn(`No text chunks generated for ${docPath}. Skipping.`);
      return;
    }
    for (const chunk of textChunks) {
      const embeddingOutput = await model(chunk, { pooling: "mean", normalize: true });
      const embeddingArray = Array.from(embeddingOutput.data);
      const embeddingString = `[${embeddingArray.join(",")}]`;
      try {
        await pool.query(
          "INSERT INTO documents (content, source, embedding) VALUES ($1, $2, $3) ON CONFLICT (source, content) DO NOTHING",
          [chunk, docPath, embeddingString]
        );
      } catch (dbError) {
        console.error(`DATABASE ERROR storing chunk from ${docPath}:`, dbError.message);
      }
    }
    console.log(`Successfully processed and stored chunks for: ${docPath}`);
  } catch (fileProcessingError) {
    console.error(`FILE PROCESSING ERROR for ${docPath}:`, fileProcessingError.message);
  }
}

async function main() {
  let model;
  try {
    console.log("Initializing sentence transformer model...");
    model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model initialized.");
  } catch (modelError) {
    console.error("FATAL: Could not initialize the sentence transformer model:", modelError.message || modelError);
    process.exit(1);
  }

  const rootDirs = [
    "contents/docs",
    "contents/constitution",
    "contents/blogs"
  ];
  let documentPaths = [];
  for (const dir of rootDirs) {
    const files = await getAllMarkdownFiles(dir);
    documentPaths.push(...files);
  }
  if (documentPaths.length === 0) {
    console.warn("No document paths found. Ensure the directories exist and contain .md/.mdx files.");
    process.exit(0);
  } else {
    console.log(`Found ${documentPaths.length} documents to process.`);
  }

  for (const docPath of documentPaths) {
    await processSingleDocument(docPath, model);
  }

  console.log("All documents processed.");
  await pool.end();
  console.log("Database pool closed.");
}

main().catch((error) => {
  console.error("Unhandled error in main execution:", error.message || error);
  process.exit(1);
});