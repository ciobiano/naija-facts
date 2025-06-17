import { pipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs/promises";
import path from "path";

// ---- Config ----
const PINECONE_API_KEY = "pcsk_8fVEA_Qir5MkvaqD5qo992PZyvdiCtwpu3S1HA2FtS4PzkkJJQecqRNBWQWvoEAd3iD6k" // Replace with your Pinecone API key
const PINECONE_INDEX_NAME = "vector-search";

if (!PINECONE_API_KEY) {
	console.error("FATAL: Pinecone API key not set.");
	process.exit(1);
}

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pinecone.Index(PINECONE_INDEX_NAME);

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// ---- Helper Functions ----
async function getAllMarkdownFiles(rootDir: string): Promise<string[]> {
	const allFiles: string[] = [];
	async function findFilesRecursively(directory: string): Promise<void> {
		try {
			const entries = await fs.readdir(directory, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.join(directory, entry.name);
				if (entry.isDirectory()) {
					await findFilesRecursively(fullPath);
				} else if (
					entry.isFile() &&
					(entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
				) {
					allFiles.push(fullPath);
				}
			}
		} catch (err: any) {
			console.error(`Error reading directory ${directory}: ${err.message}`);
		}
	}
	await findFilesRecursively(rootDir);
	return allFiles;
}

function chunkText(text: string, chunkSize = 1000, overlap = 50): string[] {
	if (!text || typeof text !== "string" || text.trim() === "") return [];
	if (chunkSize <= overlap) overlap = 0;
	const chunks: string[] = [];
	let startIndex = 0;
	while (startIndex < text.length) {
		const endIndex = Math.min(startIndex + chunkSize, text.length);
		chunks.push(text.substring(startIndex, endIndex));
		startIndex += chunkSize - overlap;
		if (startIndex >= text.length && endIndex === text.length) break;
	}
	return chunks.filter((chunk) => chunk.trim() !== "");
}

function sanitizeVectorId(text: string): string {
    // Remove non-ASCII characters and control characters
    return text.replace(/[^\x20-\x7E]/g, '')
        // Replace any remaining problematic symbols with underscores
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        // Trim to reasonable length and remove trailing/leading underscores
        .substring(0, 100)
        .replace(/^_+|_+$/g, '');
}

// ---- Main Logic ----
async function processSingleDocument(docPath: string): Promise<void> {
	console.log(`Processing document: ${docPath}`);
	try {
		const rawContent = await fs.readFile(docPath, "utf-8");
		const textChunks = chunkText(rawContent);
		if (textChunks.length === 0) {
			console.warn(`No text chunks generated for ${docPath}. Skipping.`);
			return;
		}
		
		for (const chunk of textChunks) {
			const formattedChunk = chunk.replace(/\n/g," ");
			const { data } = await embedder(formattedChunk, { pooling: 'mean', normalize: true });
			const embeddingArray = Array.from(data);
			const embeddingString = `[${embeddingArray.join(",")}]`;
			
			// Upsert to Pinecone
			await index.upsert([
				{
					id: sanitizeVectorId(`${path.basename(docPath)}-${chunk.trim().substring(0, 20)}`), // create ASCII-safe unique id
					values: Array.from(data),
					metadata: {
						content: chunk,
						source: docPath,
					},
				},
			]);

		}
		
		console.log(`Successfully processed and stored chunks for: ${docPath}`);
	} catch (fileProcessingError: any) {
		console.error(
			`FILE PROCESSING ERROR for ${docPath}:`,
			fileProcessingError.message
		);
	}
}

async function main() {
	const rootDirs = ["contents/docs"];
	const documentPaths: string[] = [];
	for (const dir of rootDirs) {
		const files = await getAllMarkdownFiles(dir);
		documentPaths.push(...files);
	}
	if (documentPaths.length === 0) {
		console.warn(
			"No document paths found. Ensure the directories exist and contain .md/.mdx files."
		);
		process.exit(0);
	} else {
		console.log(`Found ${documentPaths.length} documents to process.`);
	}

	for (const docPath of documentPaths) {
		await processSingleDocument(docPath);
	}

	console.log("All documents processed.");
	
}

main().catch((error) => {
	console.error("Unhandled error in main execution:", error.message || error);
	process.exit(1);
});
