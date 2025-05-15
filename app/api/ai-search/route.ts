import { NextRequest, NextResponse } from "next/server";
import { queryPineconeVectorStoreAndQueryLLM } from "@/scripts/utils";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { query, indexName } = body;
	if (!query || !indexName) {
		return NextResponse.json({ error: "Missing query or indexName" }, { status: 400 });
		
	}

	const text = await queryPineconeVectorStoreAndQueryLLM(body);

	return NextResponse.json({ text });
}
