
import { pipeline, Pipeline } from "@xenova/transformers";
import pg, { Pool } from "pg"; 
import fs from "fs/promises";
import path from "path";


interface FeatureExtractionPipeline extends Pipeline {
	(text: string, options: { pooling: "mean"; normalize: boolean }): Promise<{
		data: Float32Array | number[];
	}>;
}
interface PoolConfig {
	connectionString?: string;
}




// --- Helper Functions (Implement these robustly) ---

/**
 * Recursively finds all markdown (.md or .mdx) files in a given directory.
 * @param rootDir The root directory to search.
 * @returns A promise that resolves to an array of file paths.
 */
async function getAllMarkdownFiles(rootDir: string): Promise<string[]> {
	const allFiles: string[] = [];
	const currentSearchPath = path.isAbsolute(rootDir)
		? rootDir
		: path.join(process.cwd(), rootDir);

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
					// Store relative path from the original rootDir for consistency if needed
					allFiles.push(path.relative(process.cwd(), fullPath));
				}
			}
		} catch (err: any) {
			console.error(`Error reading directory ${directory}: ${err.message}`);
			// Depending on severity, you might re-throw or skip
		}
	}

	await findFilesRecursively(currentSearchPath);
	if (allFiles.length === 0) {
		console.warn(
			`No markdown files found in ${currentSearchPath}. Check the path and file extensions.`
		);
	}
	return allFiles;
}

/**
 * Chunks a given text into smaller pieces.
 * @param text The input text.
 * @param chunkSize The maximum size of each chunk.
 * @param overlap The number of characters to overlap between chunks.
 * @returns An array of text chunks.
 */
function chunkText(
	text: string,
	chunkSize: number = 500,
	overlap: number = 50
): string[] {
	if (!text || typeof text !== "string" || text.trim() === "") return [];
	if (chunkSize <= overlap) {
		console.warn(
			"chunkSize should be greater than overlap. Defaulting to no overlap."
		);
		overlap = 0;
	}

	const chunks: string[] = [];
	let startIndex = 0;
	while (startIndex < text.length) {
		const endIndex = Math.min(startIndex + chunkSize, text.length);
		chunks.push(text.substring(startIndex, endIndex));
		startIndex += chunkSize - overlap;
		if (startIndex >= text.length && endIndex === text.length) break; // Avoid empty last chunk if overlap makes it so
	}
	return chunks.filter((chunk) => chunk.trim() !== ""); // Ensure no empty chunks
}

// --- Main Processing Logic ---

const poolConfig: PoolConfig = {
	connectionString: process.env.NEON_DATABASE_URL,
};

if (!poolConfig.connectionString) {
	console.error("FATAL: NEON_DATABASE_URL environment variable is not set.");
	process.exit(1);
}

const pool = new Pool(poolConfig);

async function processSingleDocument(
	docPath: string,
	model: FeatureExtractionPipeline
): Promise<void> {
	console.log(`Processing document: ${docPath}`);
	try {
		const rawContent = await fs.readFile(docPath, "utf-8");
		const textChunks = chunkText(rawContent); // Using default chunking, adjust as needed

		if (textChunks.length === 0) {
			console.warn(`No text chunks generated for ${docPath}. Skipping.`);
			return;
		}

		for (const chunk of textChunks) {
			// Xenova's pipeline might return different types based on model; ensure data is Array-like
			const embeddingOutput = await model(chunk, {
				pooling: "mean",
				normalize: true,
			});
			const embeddingArray = Array.from(embeddingOutput.data as number[]); // Cast if necessary, ensure it's number[]
			const embeddingString = `[${embeddingArray.join(",")}]`;

			try {
				await pool.query(
					"INSERT INTO documents (content, source, embedding) VALUES ($1, $2, $3) ON CONFLICT (source, content) DO NOTHING", 


					[chunk, docPath, embeddingString]
				);
			} catch (dbError: any) {
				// Use 'any' or a more specific pg.DatabaseError
				console.error(
					`DATABASE ERROR storing chunk from ${docPath}:`,
					dbError.message
				);
				console.error(
					`Chunk content (first 50 chars): ${chunk.substring(0, 50)}...`
				);
				// Potentially log more dbError details like dbError.code
			}
		}
		console.log(`Successfully processed and stored chunks for: ${docPath}`);
	} catch (fileProcessingError: any) {
		console.error(
			`FILE PROCESSING ERROR for ${docPath}:`,
			fileProcessingError.message
		);
	}
}

async function main(): Promise<void> {
	let model: FeatureExtractionPipeline;
	try {
		console.log("Initializing sentence transformer model...");
		// Dynamically import pipeline if facing issues with ESM/CJS interop for types,
		// or ensure your tsconfig module settings are correct.
		// For Xenova, casting to our defined interface can help.
		model = (await pipeline(
			"feature-extraction",
			"Xenova/all-MiniLM-L6-v2"
		)) as FeatureExtractionPipeline;
		console.log("Model initialized.");
	} catch (modelError: any) {
		console.error(
			"FATAL: Could not initialize the sentence transformer model:",
			modelError.message || modelError
		);
		process.exit(1);
	}

	let documentPaths: string[] = [];
	try {
		console.log("Gathering markdown files from 'contents/' directory...");
		documentPaths = await getAllMarkdownFiles("contents"); // Target the 'contents' directory
		if (documentPaths.length === 0) {
			console.warn(
				"No document paths found in 'contents/'. Ensure the directory exists and contains .md/.mdx files."
			);
			// Consider exiting if no files are found, or if this is acceptable.
			// process.exit(0); // or return;
		} else {
			console.log(`Found ${documentPaths.length} documents to process.`);
		}
	} catch (fileDiscoveryError: any) {
		console.error(
			"FATAL: Error discovering markdown files:",
			fileDiscoveryError.message
		);
		process.exit(1);
	}

	const clearTable = process.argv.includes("--clear-table");

    
	if (clearTable) {
		try {
			console.log(
				"Clearing existing documents from the 'documents' table as per --clear-table flag..."
			);
			await pool.query("TRUNCATE TABLE documents");
			console.log("Successfully cleared the documents table.");
		} catch (truncateError: any) {
			console.error("Error truncating documents table:", truncateError.message);
			// Decide if you want to proceed or exit
			// process.exit(1);
		}
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
