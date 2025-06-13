import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
	// Cultural image uploader
	culturalImageUploader: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 10,
		},
	})
		.middleware(async () => {
			// Authentication check
			const session = await getServerSession(authOptions);

			if (!session?.user?.id) {
				throw new UploadThingError("Unauthorized");
			}

			// Return user metadata
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Upload complete for userId:", metadata.userId);
			console.log("File URL:", file.ufsUrl);
			console.log("File details:", {
				name: file.name,
				size: file.size,
				type: file.type,
				key: file.key,
			});

			// Generate clean title from filename
			const cleanTitle = file.name
				.replace(/\.[^/.]+$/, "")
				.replace(/[-_]/g, " ");
			const altText = `Nigerian cultural image: ${cleanTitle}`;

			// Just return the file data - don't save to database yet
			// Database saving will happen when user completes metadata step
			return {
				success: true,
				fileKey: file.key,
				url: file.ufsUrl,
				title: cleanTitle,
				altText: altText,
				uploadedBy: metadata.userId,
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
