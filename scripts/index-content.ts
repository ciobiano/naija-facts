import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { pipeline } from "@xenova/transformers";

import dotenv from "dotenv";
import {ROUTES} from '../lib/routes-config'

dotenv.config({ path: ".env.local" }); // Load environment variables

// --- Configuration ---
const DOCS_DIR =  "contents/docs";
const BLOGS_DIR = path.join(process.cwd(), "contents/blogs");
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const TEXT_MAX_LENGTH = 512 * 3;

// --- Initialize PostgreSQL Client ---
const { Pool } = pg;
const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
	// ssl: {
	//   rejectUnauthorized: false // Or configure properly for production if needed
	// } // Neon typically handles SSL well; check if you need specific SSL settings.
});

pool.on("connect", () => {
	console.log("Connected to Neon PostgreSQL database!");
});

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
	process.exit(-1);
});





async function extractTextFromMdx(rawMdxInput) {
	// 1. Remove frontmatter first, as remark might try to parse it as Markdown
	const { content: mdxContentAfterFrontmatter } = matter(rawMdxInput);

	const file = await unified()
		.use(remarkParse)
		.use(remarkMdx)
		.use(remarkStripMarkdown, {
			keep: [
				"paragraph",
				"heading",
				"listItem",
				"emphasis",
				"strong",
				"inlineCode",
			],
		})
		.use(remarkStringify)
		.process(mdxContentAfterFrontmatter);

	let text = String(file).trim();

	text = text.replace(/\s+/g, " ").trim();

	if (text.length > TEXT_MAX_LENGTH) {
		console.log(
			`Truncating text for embedding. Original length: ${text.length}, Max length: ${TEXT_MAX_LENGTH}`
		);
		text = text.substring(0, TEXT_MAX_LENGTH);
	}
	return text;
}



// --- Discover Doc Files based on ROUTES config ---
async function discoverDocFilesFromRoutes(routesConfig, currentPathPrefix = '') {
    let filesToProcess = [];
    for (const route of routesConfig) {
        if (!route.href) continue; // Skip routes without href

        
        const slugPart = route.href.startsWith('/') ? route.href.substring(1) : route.href;
        const currentSlug = path.join(currentPathPrefix, slugPart).replace(/\\/g, '/'); // Normalize path separators

        const filePath = path.join(process.cwd(), DOCS_DIR, currentSlug, 'index.mdx');

        try {
            // Check if the file actually exists before adding
            await fs.access(filePath); // Throws error if file doesn't exist
            filesToProcess.push({
                filePath: filePath,
                slug: currentSlug, // This slug should match what's used in getCompiledDocsForSlug
                type: 'doc'
            });
        } catch (err) {
            // console.warn(`Doc file not found for route ${route.href} at ${filePath}, skipping.`);
            // It's possible some routes don't have index.mdx (e.g., category routes that are just for nav)
            // If a route *should* have content but file is missing, this warning is useful.
        }

        if (route.items && route.items.length > 0) {
            filesToProcess = filesToProcess.concat(
                await discoverDocFilesFromRoutes(route.items, currentSlug)
            );
        }
    }
    return filesToProcess;
}


async function discoverBlogFiles(dir) {
	let results = [];
	const list = await fs.readdir(dir, { withFileTypes: true });

	for (const dirent of list) {
		const fullPath = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			// Assuming blogs are not in subdirectories for now, based on getAllBlogsFrontmatter
			// If they can be, this part needs recursion too.
			console.warn(
				`Found subdirectory in blogs: ${fullPath}. Skipping, as current logic assumes flat blog structure.`
			);
		} else if (dirent.name.endsWith(".mdx")) {
			results.push({
				filePath: fullPath,
				slug: dirent.name.replace(/\.mdx$/, ""), // Slug from filename
				type: "blog",
			});
		}
	}
	return results;
}
// --- Main Indexing Function ---
async function indexContent() {
	console.log("Starting content indexing...");

	// 1. Initialize embedding model
	console.log(`Loading embedding model: ${EMBEDDING_MODEL}`);
	const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
	console.log("Embedding model loaded.");

	const client = await pool.connect();
	try {


		console.log('Discovering doc files from ROUTES configuration...');
        const docFiles = await discoverDocFilesFromRoutes(ROUTES); // Pass the imported ROUTES
        console.log(`Found ${docFiles.length} doc files from ROUTES.`);import { pg } from 'pg';


        // 2. Discover Blog files by scanning directory
        console.log(`Processing blogs in: ${BLOGS_DIR}`);
        const blogFiles = await discoverBlogFiles(BLOGS_DIR);
        console.log(`Found ${blogFiles.length} blog files by scanning directory.`);


		const allFiles = [...docFiles, ...blogFiles];
		console.log(`Found ${allFiles.length} MDX files to process.`);

		for (const file of allFiles) {
			console.log(`Processing: ${file.filePath}`);
			try {
				const rawMdx = await fs.readFile(file.filePath, "utf-8");
				const { data: frontmatter } = matter(rawMdx); // Parse frontmatter

				if (!frontmatter.title || !file.slug) {
                    console.warn(`Skipping ${file.filePath} (Slug: ${file.slug}) due to missing title or slug.`);
                    continue;
                }
				
                const textToEmbed = await extractTextFromMdx(rawMdx); 
                if (!textToEmbed) {
                    console.warn(`Skipping ${file.filePath} (Slug: ${file.slug}) as no text content found after extraction.`);
                    continue;
                }

				// Generate embedding
				const output = await extractor(textToEmbed, {
					pooling: "mean",
					normalize: true,
				});
				const embedding = Array.from(output.data); // Convert Float32Array to regular array

				// Upsert (Insert or Update) data into PostgreSQL
				// This query tries to insert. If a document with the same slug exists, it updates it.
				const upsertQuery = `
                    INSERT INTO documents (slug, type, title, description, raw_content,tags, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (slug) DO UPDATE
                    SET type = EXCLUDED.type,
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        raw_content = EXCLUDED.raw_content,
                        tags = EXCLUDED.raw.tags
                        embedding = EXCLUDED.embedding,
                       
                    RETURNING id;
                `;

				const values = [
					file.slug,
					file.type,
					frontmatter.title,
					frontmatter.description || null, // Handle optional description
					textToEmbed, // Storing the text used for embedding
					`[${embedding.join(",")}]`, // Format as PostgreSQL array string
				];

				const res = await client.query(upsertQuery, values);
				console.log(`Indexed ${file.slug} (ID: ${res.rows[0].id})`);
			} catch (err) {
				console.error(`Error processing file ${file.filePath}:`, err);
			}
		}

		console.log("Content indexing finished successfully!");
	} catch (error) {
		console.error("Error during indexing process:", error);
	} finally {
		client.release(); // Release the client back to the pool
		await pool.end(); // Close all connections in the pool
		console.log("Database connection closed.");
	}
}

// --- Helper to recursively read MDX files and generate slugs ---
// This needs to be adapted to your specific slug generation logic from `lib/markdown.ts` or file structure
async function readMdxFilesRecursive(dir, type, baseSlug = "") {
	let results = [];
	const list = await fs.readdir(dir, { withFileTypes: true });

	for (const dirent of list) {
		const fullPath = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			// For docs, slugs are typically nested based on directory structure
			const nextSlugPart = dirent.name;
			results = results.concat(
				await readMdxFilesRecursive(
					fullPath,
					type,
					path.join(baseSlug, nextSlugPart)
				)
			);
		} else if (dirent.name === "index.mdx" && type === "doc") {
			// Docs often use index.mdx
			results.push({
				filePath: fullPath,
				slug: baseSlug || dirent.name.replace(/\.mdx$/, ""), // Handle root index.mdx if any
				type: type,
			});
		} else if (dirent.name.endsWith(".mdx") && type === "blog") {
			// Blogs might be flat files
			results.push({
				filePath: fullPath,
				slug: dirent.name.replace(/\.mdx$/, ""), // Slug from filename for blogs
				type: type,
			});
		}
		// Add more conditions if your slug generation or file naming is different
		// This part is highly dependent on your `contents/docs` structure and how you derive slugs.
		// You might need to replicate logic from your existing `getCompiledDocsForSlug` or `getAllChilds` if slugs are complex.
	}
	return results;
}

// --- Run the script ---
indexContent().catch((err) => {
	console.error("Failed to run indexing script:", err);
	process.exit(1);
});
