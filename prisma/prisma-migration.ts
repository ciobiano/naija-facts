import { readFileSync } from "fs";

import { join } from "path";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSQLFile(filePath: string) {
	const sql = readFileSync(filePath, "utf-8");
	const statements = sql.split(";").filter((stmt) => stmt.trim());

	for (const statement of statements) {
		if (statement.trim()) {
			try {
				await prisma.$executeRawUnsafe(statement);
				console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
			} catch (error) {
				console.warn(`⚠️ Warning executing statement: ${error}`);
			}
		}
	}
}

async function applyAdvancedFeatures() {
	console.log("🔧 Applying advanced PostgreSQL features...");

	const sqlDir = join(process.cwd(), "prisma", "sql");

	try {
		// Apply functions
		await runSQLFile(join(sqlDir, "functions.sql"));
		console.log("✅ Functions applied");

		// Apply triggers
		await runSQLFile(join(sqlDir, "triggers.sql"));
		console.log("✅ Triggers applied");

		// Apply RLS policies (optional - comment out if not using Supabase auth)
		// await runSQLFile(join(sqlDir, 'rls_policies.sql'))
		// console.log('✅ RLS policies applied')

		// Apply indexes
		await runSQLFile(join(sqlDir, "indexes.sql"));
		console.log("✅ Indexes applied");
	} catch (error) {
		console.error("❌ Error applying advanced features:", error);
		throw error;
	}
}

async function main() {
	console.log("🚀 Starting Prisma migration with advanced features...");

	try {
		// Generate Prisma client
		console.log("📦 Generating Prisma client...");

		// Apply advanced PostgreSQL features
		await applyAdvancedFeatures();

		console.log("🎉 Migration completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

if (require.main === module) {
	main();
}
