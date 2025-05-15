# Plan to Resolve Module Parse Error with onnxruntime-node

**Objective:** Replace the `@xenova/transformers` based embedding generation in `scripts/utils.ts` with OpenAI's embedding API to resolve the `Module parse failed` error related to native modules (`onnxruntime-node`, `sharp`, etc.).

**Problem:** The current implementation uses `@xenova/transformers` for feature extraction, which relies on `onnxruntime-node`, a native module. Webpack is failing to parse this binary file during the build process in the Next.js environment, leading to the `Module parse failed: Unexpected character '�'` error. Attempts to configure webpack with `node-loader` and build from source were not successful or feasible in this context.

**Proposed Solution:** Utilize OpenAI's embedding API to generate embeddings. This approach offloads the computation to OpenAI's servers, eliminating the dependency on local native modules and the associated webpack issues.

**Plan:**

1.  **Verify OpenAI package:** Check if the necessary package for OpenAI embeddings is installed. The `@langchain/openai` package might already include this, but we'll confirm.
2.  **Modify `scripts/utils.ts`:**
    *   Remove the import of `pipeline` from `@xenova/transformers`.
    *   Introduce or utilize the OpenAI embeddings functionality (likely via `@langchain/openai`).
    *   Update the `queryPineconeVectorStoreAndQueryLLM` function to use the OpenAI embedding model (e.g., `text-embedding-ada-002` or a newer recommended model) to generate embeddings for the input query.
3.  **Test:** Confirm that the `/api/ai-search` API route now functions correctly without the previous error.

**Diagram:**

```mermaid
graph TD
    A[Next.js API Route /api/ai-search] --> B[scripts/utils.ts]
    B --> C{Generate Embeddings}
    C --> D1[Current: @xenova/transformers + onnxruntime-node]
    C --> D2[Proposed: OpenAI Embedding API]
    D1 -- problematic --> E[Webpack Build]
    D2 -- API Call --> F[OpenAI Servers]
    F --> C
    C --> G[Pinecone Query]
    G --> H[Langchain + LLM]
    H --> B
    B --> A