import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const f = createUploadthing();

export const ourFileRouter = {
	// Cultural media uploader (images and videos) - Client-First approach
	culturalImageUploader: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 10,
		},
		video: {
			maxFileSize: "64MB",
			maxFileCount: 5,
		},
	})
		.middleware(async () => {
			try {
				console.log(
					"🔍 UploadThing middleware: Starting authentication check..."
				);

				// Authentication check
				const session = await getServerSession(authOptions);

				console.log("🔍 UploadThing middleware: Session result:", {
					hasSession: !!session,
					hasUser: !!session?.user,
					hasUserId: !!session?.user?.id,
					userId: session?.user?.id,
				});

				if (!session?.user?.id) {
					console.log(
						"❌ UploadThing middleware: Authentication failed - no session or user ID"
					);
					throw new UploadThingError("Unauthorized");
				}

				console.log(
					"✅ UploadThing middleware: Authentication successful for user:",
					session.user.id
				);

				// Return user metadata
				return { userId: session.user.id };
			} catch (error) {
				console.error("💥 UploadThing middleware error:", error);
				throw new UploadThingError(
					`Authentication failed: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Upload complete for userId:", metadata.userId);
			console.log("File URL:", file.url);

			// CLIENT-FIRST: Don't save to database here
			// Just return file information for the client to use

			// Determine content type from MIME type
			const contentType = file.type.startsWith("video/") ? "video" : "image";

			// Return data that the client can use to create the DB record
			return {
				success: true,
				fileUrl: file.url,
				fileKey: file.key,
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
				contentType: contentType,
				uploadedBy: metadata.userId,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
