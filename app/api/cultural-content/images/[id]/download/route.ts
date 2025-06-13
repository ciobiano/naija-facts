import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { culturalCache } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

interface CachedImageData {
	id: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	title: string;
	cached_at: number;
}

export async function POST(request: NextRequest, context: RouteContext) {
	const startTime = Date.now();

	try {
		// NextJS 15: await params before accessing properties
		const params = await context.params;
		const imageId = params.id;

		console.log(`🔍 Processing download request for image: ${imageId}`);

		const session = await getServerSession(authOptions);

		// Get client IP and user agent for analytics
		const forwardedFor = request.headers.get("x-forwarded-for");
		const realIp = request.headers.get("x-real-ip");
		const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";
		const userAgent = request.headers.get("user-agent") || "unknown";

		if (!imageId) {
			return NextResponse.json(
				{ error: "Image ID is required" },
				{ status: 400 }
			);
		}

		console.log(`🔍 Looking for image ${imageId} in cache...`);
		let image: CachedImageData | null = null;

		try {
			image = await culturalCache.getImageMetadata(imageId);
		} catch (cacheError) {
			console.warn(`⚠️ Cache read failed for ${imageId}:`, cacheError);
			
      
		}

		const cacheHit = !!image;

		if (!image) {
			console.log(`💾 Cache miss for ${imageId}, fetching from database...`);

			try {
				const dbImage = await prisma.culturalImage.findUnique({
					where: { id: imageId },
					select: {
						id: true,
						file_path: true,
						file_size: true,
						mime_type: true,
						title: true,
					},
				});

				if (!dbImage) {
					return NextResponse.json(
						{ error: "Image not found" },
						{ status: 404 }
					);
				}

				// Transform to cached format
				image = {
					...dbImage,
					cached_at: Date.now(),
				};

				// Try to cache the result
				try {
					await culturalCache.cacheImageMetadata(imageId, image, 3600);
					console.log(`✅ Cached image metadata for ${imageId}`);
				} catch (cacheWriteError) {
					console.warn(
						`⚠️ Failed to cache metadata for ${imageId}:`,
						cacheWriteError
					);
					// Continue without caching
				}
			} catch (dbError) {
				console.error(`❌ Database error for ${imageId}:`, dbError);
				return NextResponse.json(
					{ error: "Database error occurred" },
					{ status: 500 }
				);
			}
		} else {
			console.log(`🎯 Cache HIT for image ${imageId}!`);
		}

		// Analytics tracking (non-blocking)
		try {
			// Create download record for analytics (keep this immediate for accuracy)
			await prisma.culturalImageDownload.create({
				data: {
					image_id: imageId,
					user_id: session?.user?.id || null,
					ip_address: ipAddress,
					user_agent: userAgent,
					file_format: image.mime_type,
					file_size: image.file_size,
				},
			});

			// Try to increment Redis counter
			try {
				await culturalCache.incrementViewCount(`download:${imageId}`);
				console.log(`📈 Incremented download count for ${imageId} in Redis`);
			} catch (redisError) {
				console.warn(`⚠️ Redis increment failed for ${imageId}:`, redisError);
			}

			// Update database counter
			await prisma.culturalImage.update({
				where: { id: imageId },
				data: {
					download_count: {
						increment: 1,
					},
				},
			});
		} catch (analyticsError) {
			console.error("❌ Analytics error (non-blocking):", analyticsError);
			// Don't fail the request for analytics errors
		}

		const processingTime = Date.now() - startTime;

		console.log(
			`⚡ Request processed in ${processingTime}ms (Cache: ${
				cacheHit ? "HIT" : "MISS"
			})`
		);

		return NextResponse.json({
			success: true,
			downloadUrl: image.file_path,
			filename: `${image.title.replace(/[^a-zA-Z0-9]/g, "_")}.${
				image.mime_type.split("/")[1]
			}`,
			fileSize: image.file_size,
			mimeType: image.mime_type,
			// 🔍 DEBUG INFO: Include performance metrics (remove in production)
			debug: {
				cacheHit,
				processingTimeMs: processingTime,
				cachedAt: image.cached_at,
			},
		});
	} catch (error) {
		const processingTime = Date.now() - startTime;
		console.error(`❌ Error processing download (${processingTime}ms):`, error);

		return NextResponse.json(
			{
				error: "Failed to process download",
				message: error instanceof Error ? error.message : "Unknown error",
				debug: {
					processingTimeMs: processingTime,
				},
			},
			{ status: 500 }
		);
	}
}
