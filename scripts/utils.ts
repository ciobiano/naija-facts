import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { Index, Pinecone } from "@pinecone-database/pinecone";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";






export const queryPineconeVectorStoreAndQueryLLM = async ({ query, indexName }: { query: string, indexName: string }) => {
	console.log(`Asking question: ${query}...`);

	// Target the index
	const pinecone = new Pinecone({
		apiKey: process.env.PINECONE_API_KEY!,
	});

	const index = pinecone.Index(indexName);

	const embeddings = new HuggingFaceInferenceEmbeddings({
		apiKey: process.env.HF_INFERENCE_API_KEY,

		model: "sentence-transformers/all-MiniLM-L6-v2",
	});
	// 2. Query the Pinecone index with the embeddings
	const queryEmbedding = await embeddings.embedQuery(query);
	const queryResponse = await index.query({
		vector: queryEmbedding,
		topK: 5,
		includeMetadata: true,
		includeValues: false,
	});

	console.log(`Found ${queryResponse.matches.length} matches...`);

	console.log(`Asking question: ${query}...`);

	if (queryResponse.matches.length) {
		const llm = new ChatOpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0,
			modelName: "gpt-3.5-turbo",
			maxTokens: 2000,

		});
		const chain = loadQAStuffChain(llm);
		// 3. Extract and concatenate page content from matched documents
		const concatenatedPageContent = queryResponse.matches
			.map((match) => match.metadata?.pageContent)
			.join(" ");

		console.log(`Concatenated page content: ${concatenatedPageContent}`);

		const result = await chain.invoke({
			input_documents: [new Document({ pageContent: concatenatedPageContent })],
			question: query,
		});

		console.log(`Answer: ${result.text}`);
		return result.text;
	} else {
		// 4. Log that there are no matches, so GPT-3 will not be queried
		console.log("Since there are no matches, GPT-3 will not be queried.");
		return "No relevant documents found.";
	}
};
