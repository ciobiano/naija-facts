import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_API_KEY =
	"pcsk_8fVEA_Qir5MkvaqD5qo992PZyvdiCtwpu3S1HA2FtS4PzkkJJQecqRNBWQWvoEAd3iD6k"; // Replace with your Pinecone API key
const PINECONE_INDEX_NAME = "naija-facts";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

let index: any = null;

async function getIndex() {
    if (!pinecone) {
        console.error("Pinecone client not initialized.");
        return null;
    }
  if (!index) {
    index = pinecone.Index(PINECONE_INDEX_NAME);
  }
  return index;
}

const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
const llm = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo", // or "gpt-4" if you have access
  temperature: 0,
});

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { query } = payload;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return NextResponse.json({ query: query || "N/A", error: "Query is required and must be a non-empty string" }, { status: 400 });
  }

  // 1. Query Pinecone
  const pineconeIndex = await getIndex();
  if (!pineconeIndex) {
      return NextResponse.json({ error: "Pinecone client not initialized." }, { status: 500 });
  }
  const vectorQueryResponse = await pineconeIndex.query({
    topK: 5,
    vector: (await embeddings.embedQuery(query.replace(/\n/g, " "))),
    includeMetadata: true,
  });

  const docs = vectorQueryResponse.matches || [];

  if (!docs.length) {
    return NextResponse.json({ query, topChunks: [], message: "No relevant documents found." });
  }

  // 3. Compose the RAG prompt
  const context = docs.map((doc: any) => doc.metadata.content).join("\n---\n");
  const prompt = [
    { role: "system", content: "You are a helpful assistant. Answer the user's question based only on the provided context." },
    { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer:` },
  ];

  // 4. Run the LLM with the context
  try {
    const chain = RunnableSequence.from([
      (input: string) => prompt,
      llm,
      new StringOutputParser(),
    ]);
    const answer = await chain.invoke(query);

    return NextResponse.json({
      query,
      answer,
      sources: docs.map((doc: any) => doc.metadata.source), // or doc.metadata.source if you want just the path
      topChunks: docs.map((doc: any) => ({ content: doc.metadata.content, source: doc.metadata.source })),
    });
  } catch (err: any) {
    return NextResponse.json({
      query,
      topChunks: docs.map((doc: any) => ({ content: doc.metadata.content, source: doc.metadata.source })),
      error: "Failed to generate answer from LLM.",
      details: err.message,
    });
  }
}