#!/usr/bin/env tsx

/**
 * Redis Batch Processor
 *
 * This script runs as a background job to process batched data from Redis
 * and sync it to the database for efficiency.
 *
 * Real-world scenario: Instead of writing to DB on every view/download,
 * we batch operations in Redis and process them periodically.
 *
 * Usage:
 * - Development: tsx scripts/redis-batch-processor.ts
 * - Production: Add to cron job or process manager
 */

import { PrismaClient } from "@prisma/client";

// Import Redis client after installation
// import { culturalCache } from '../lib/redis';

const prisma = new PrismaClient();

interface BatchProcessorStats {
	viewsProcessed: number;
	downloadsProcessed: number;
	errorsCount: number;
	processingTimeMs: number;
}

class RedisBatchProcessor {
	private isRunning = false;

	async processViewCounts(): Promise<BatchProcessorStats> {
		const startTime = Date.now();
		const stats: BatchProcessorStats = {
			viewsProcessed: 0,
			downloadsProcessed: 0,
			errorsCount: 0,
			processingTimeMs: 0,
		};

		try {
			console.log("🔄 Starting view count batch processing...");

			// Uncomment after Redis installation:
			// const batchedCounts = await culturalCache.getBatchedViewCounts();

			// Simulate batch data for demo
			const batchedCounts = {
				// 'image123': 15,
				// 'image456': 8,
				// 'image789': 23
			};

			if (Object.keys(batchedCounts).length === 0) {
				console.log("✅ No batched view counts to process");
				return stats;
			}

			console.log(
				`📊 Processing ${
					Object.keys(batchedCounts).length
				} batched view counts...`
			);

			// Process each image's batched views
			for (const [imageId, count] of Object.entries(batchedCounts)) {
				try {
					await prisma.culturalImage.update({
						where: { id: imageId },
						data: {
							view_count: {
								increment: count,
							},
						},
					});

					stats.viewsProcessed += count;
					console.log(`✅ Updated view count for image ${imageId}: +${count}`);
				} catch (error) {
					console.error(
						`❌ Failed to update view count for image ${imageId}:`,
						error
					);
					stats.errorsCount++;
				}
			}

			// Clear processed counts from Redis
			// await culturalCache.clearBatchedViewCounts(Object.keys(batchedCounts));

			stats.processingTimeMs = Date.now() - startTime;

			console.log(`🎉 Batch processing completed:`);
			console.log(`   - Views processed: ${stats.viewsProcessed}`);
			console.log(`   - Processing time: ${stats.processingTimeMs}ms`);
			console.log(`   - Errors: ${stats.errorsCount}`);

			return stats;
		} catch (error) {
			console.error("❌ Batch processing failed:", error);
			stats.errorsCount++;
			stats.processingTimeMs = Date.now() - startTime;
			return stats;
		}
	}

	async processDownloadCounts(): Promise<void> {
		// Similar logic for download counts
		console.log("🔄 Processing download counts (similar to view counts)...");

		// Implementation would be similar to processViewCounts
		// but for download-specific batching
	}

	async run(): Promise<void> {
		if (this.isRunning) {
			console.log("⚠️ Batch processor already running, skipping...");
			return;
		}

		this.isRunning = true;
		console.log("🚀 Starting Redis batch processor...");

		try {
			// Process view counts
			await this.processViewCounts();

			// Process download counts
			await this.processDownloadCounts();

			console.log("✅ All batch processing completed successfully");
		} catch (error) {
			console.error("❌ Batch processor error:", error);
		} finally {
			this.isRunning = false;
		}
	}

	async runContinuously(intervalMinutes: number = 5): Promise<void> {
		console.log(
			`🔄 Starting continuous batch processing (every ${intervalMinutes} minutes)`
		);

		const intervalMs = intervalMinutes * 60 * 1000;

		// Run immediately once
		await this.run();

		// Then run on interval
		setInterval(async () => {
			await this.run();
		}, intervalMs);
	}
}

// Example usage scenarios

/**
 * 🎯 REAL-WORLD SCENARIOS:
 *
 * Scenario 1: High Traffic Nigerian Cultural Site
 * - 1000+ users viewing images during peak hours
 * - Without batching: 1000 DB writes per minute
 * - With batching: 1 DB write per minute per image
 * - Performance improvement: 90%+ reduction in DB load
 *
 * Scenario 2: Viral Content
 * - Nigerian cultural image shared on social media
 * - 10,000 views in 1 hour
 * - Without batching: Database overload, potential timeouts
 * - With batching: Smooth operation, real-time Redis counters
 *
 * Scenario 3: Educational Usage
 * - Schools using platform for Nigerian history lessons
 * - 500 students accessing content simultaneously
 * - Batching ensures platform stays responsive
 */

// CLI Interface
async function main() {
	const processor = new RedisBatchProcessor();

	const mode = process.argv[2] || "once";

	switch (mode) {
		case "once":
			console.log("🔄 Running batch processor once...");
			await processor.run();
			process.exit(0);

		case "continuous":
			const interval = parseInt(process.argv[3]) || 5;
			console.log(
				`🔄 Running batch processor continuously (${interval} min intervals)...`
			);
			await processor.runContinuously(interval);
			break;

		case "help":
		default:
			console.log(`
Redis Batch Processor for Naija Facts

Usage:
  tsx scripts/redis-batch-processor.ts [mode] [interval]

Modes:
  once         - Run batch processing once and exit
  continuous   - Run continuously with interval (default: 5 minutes)
  help         - Show this help message

Examples:
  tsx scripts/redis-batch-processor.ts once
  tsx scripts/redis-batch-processor.ts continuous 3
  
Environment Variables Required:
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  DATABASE_URL
      `);
			process.exit(0);
	}
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("\n🛑 Shutting down batch processor gracefully...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\n🛑 Received SIGTERM, shutting down...");
	process.exit(0);
});

// Run if this file is executed directly
if (require.main === module) {
	main().catch(console.error);
}

export { RedisBatchProcessor };
