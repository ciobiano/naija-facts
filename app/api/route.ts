import { NextRequest, NextResponse } from "next/server";
import { pipeline, Pipeline } from "@xenova/transformers";
import pg from "pg";

// ---- Interfaces and Types ----
interface QueryPayload {
	query?: string;
}

interface DocumentChunk {
	content: string;
	source: string;

	distance?: number;
}

interface SearchResult {
	query?: string;

	topChunks?: DocumentChunk[];

	answer?: string;
	sources?: string[];
	constructedPrompt?: string;
	error?: string;
	details?: string;
}

// Define an interface for the embedding model (pipeline) for clarity
interface FeatureExtractionPipeline extends Pipeline {
	(text: string, options: { pooling: "mean"; normalize: boolean }): Promise<{
		data: Float32Array | number[];
	}>;
}

// For LLM response if you use Hugging Face or similar
interface HfInferenceResponse {
	generated_text?: string;
	// Other fields depending on the model/API
}
interface HfErrorResponse {
	error?: string;
	// other error details
}

// ---- Environment Variables & Configuration ----
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const HUGGING_FACE_INFERENCE_API_URL =
	"https://api-inference.huggingface.co/models/deepseek-ai/deepseek-llm-1.3b-chat";
if (!NEON_DATABASE_URL) {
	console.error("FATAL: NEON_DATABASE_URL environment variable is not set.");
}

// ---- Database Pool ----

let pool: pg.Pool;
if (NEON_DATABASE_URL) {
	pool = new pg.Pool({ connectionString: NEON_DATABASE_URL });
	pool.on("error", (err, client) => {
		console.error("Unexpected error on idle client", err);
		process.exit(-1);
	});
} else {
	console.warn("NeonDB pool not initialized due to missing NEON_DATABASE_URL.");
}

// ---- Model Initialization ----
// Cache the model pipeline instance
let featureExtractor: FeatureExtractionPipeline | null = null;

async function getFeatureExtractor(): Promise<FeatureExtractionPipeline> {
	if (!featureExtractor) {
		try {
			console.log("Initializing feature extraction model...");
			featureExtractor = (await pipeline(
				"feature-extraction",
				"Xenova/all-MiniLM-L6-v2"
			)) as FeatureExtractionPipeline;
			console.log("Feature extraction model initialized.");
		} catch (error) {
			console.error("Failed to initialize feature extraction model:", error);
			throw new Error("ModelInitializationError");
		}
	}
	return featureExtractor;
}

// ---- Main Route Handler ----
export async function POST(
	request: NextRequest
): Promise<NextResponse<SearchResult>> {
	if (!pool) {
		console.error("Database pool is not initialized. Check NEON_DATABASE_URL.");
		return NextResponse.json(
			{
				error: "Server configuration error: Database not available.",
			},
			{ status: 500 }
		);
	}

	let payload: QueryPayload;
	try {
		payload = await request.json();
	} catch (error) {
		return NextResponse.json(
			{ error: "Invalid JSON payload" },
			{ status: 400 }
		);
	}

	const { query } = payload;

	if (!query || typeof query !== "string" || query.trim() === "") {
		return NextResponse.json(
			{
				query: query || "N/A",
				error: "Query is required and must be a non-empty string",
			},
			{ status: 400 }
		);
	}

	try {
		const model = await getFeatureExtractor();
		const queryEmbeddingOutput = await model(query.trim(), {
			pooling: "mean",
			normalize: true,
		});
		const queryVector = Array.from(queryEmbeddingOutput.data as number[]);
		const queryEmbeddingString = `[${queryVector.join(",")}]`;

		// Search in NeonDB using pgvector
		const dbResult = await pool.query<{
			content: string;
			source: string;
			distance: number;
		}>(
			`SELECT content, source, embedding <=> $1 AS distance
       FROM documents
       ORDER BY distance ASC
       LIMIT 5`,
			[queryEmbeddingString]
		);

		const topChunks: DocumentChunk[] = dbResult.rows;

		if (topChunks.length === 0) {
			return NextResponse.json({
				query,
				topChunks: [],
				message: "No relevant documents found.",
			} as SearchResult);
		}

		// --- Option: Use an LLM to generate a direct answer ---
		// This part is optional and requires an LLM (e.g., via Hugging Face)
		if (HUGGING_FACE_TOKEN && HUGGING_FACE_INFERENCE_API_URL) {
			const context = topChunks.map((r) => r.content).join("\n---\n");
			const prompt = `You are a helpful assistant. Answer the user's question based only on the provided context."\n\nContext:\n${context}\n\nQuestion: ${query}\n\nAnswer:`;

			try {
				const hfResponse = await fetch(HUGGING_FACE_INFERENCE_API_URL, {
					headers: {
						Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
						"Content-Type": "application/json",
					},
					method: "POST",
					body: JSON.stringify({
						inputs: prompt,
						parameters: { max_new_tokens: 250, return_full_text: false },
					}), // return_full_text: false is common for instruct models
				});

				if (!hfResponse.ok) {
					const errorBody: HfErrorResponse | string = await hfResponse
						.json()
						.catch(() => hfResponse.text());
					console.error(
						"Hugging Face API Error:",
						hfResponse.status,
						errorBody
					);
					// Fallback to returning chunks if LLM fails
					return NextResponse.json({
						query,
						topChunks,
						constructedPrompt: prompt, // For debugging
						error: "Failed to generate answer from LLM.",
						details:
							typeof errorBody === "string" ? errorBody : errorBody.error,
					});
				}

				const llmResults: HfInferenceResponse[] = await hfResponse.json(); // HF API often returns an array
				const answer = llmResults[0]?.generated_text?.trim();

				if (answer) {
					return NextResponse.json({
						query,
						answer,
						sources: topChunks.map((c) => c.source), // Provide sources for the LLM answer
						// topChunks, // Optionally return chunks as well
						// constructedPrompt: prompt // For debugging
					});
				} else {
					// Fallback if LLM response is empty but successful
					return NextResponse.json({
						query,
						topChunks,
						constructedPrompt: prompt,
						error: "LLM returned an empty answer.",
					});
				}
			} catch (llmError: any) {
				console.error("Error calling LLM:", llmError);
				// Fallback to returning just the chunks
				return NextResponse.json({
					query,
					topChunks,
					error:
						"An error occurred while trying to generate an answer with the LLM.",
					details: llmError.message,
				});
			}
		} else {
			// If LLM is not configured, just return the chunks
			console.warn(
				"LLM (Hugging Face Token/URL) not configured. Returning raw chunks."
			);
			return NextResponse.json({ query, topChunks });
		}
	} catch (error: any) {
		console.error("API Search Error:", error);
		let errorMessage = "An internal server error occurred.";
		if (error.message === "ModelInitializationError") {
			errorMessage =
				"Failed to initialize the search model. Please try again later.";
		}
		// Avoid exposing detailed internal errors to the client unless necessary
		return NextResponse.json(
			{ query: query || "N/A", error: errorMessage, details: error.message },
			{ status: 500 }
		);
	}
}
