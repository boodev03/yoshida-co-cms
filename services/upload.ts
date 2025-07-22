import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 configuration using environment variables
const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT || `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || "";

type UploadFileType = "image" | "video";

interface UploadOptions {
    file: File;
    type: UploadFileType;
    path?: string; // Optional custom path in storage
}

export const uploadFile = async ({
    file,
    type,
    path = "uploads",
}: UploadOptions): Promise<string> => {
    try {
        // Validate file type
        if (type === "image" && !file.type.startsWith("image/")) {
            throw new Error("Invalid file type. Expected an image file.");
        }
        if (type === "video" && !file.type.startsWith("video/")) {
            throw new Error("Invalid file type. Expected a video file.");
        }

        // Create a unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${file.name}`;
        const key = `${path}/${type}s/${uniqueFilename}`;

        // Convert File to Buffer for R2 upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });

        await r2Client.send(command);

        // Return the public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
        return publicUrl;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

// Helper function to delete a file from R2
export const deleteFile = async (key: string): Promise<boolean> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};

// Helper function to upload multiple files
export const uploadMultipleFiles = async (
    files: File[],
    type: UploadFileType,
    path?: string
): Promise<string[]> => {
    try {
        const uploadPromises = files.map((file) =>
            uploadFile({ file, type, path })
        );
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading multiple files:", error);
        throw error;
    }
};

// Helper function to validate file size
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeBytes;
};

// Helper function to validate file type
export const validateFileType = (
    file: File,
    allowedTypes: string[]
): boolean => {
    return allowedTypes.includes(file.type);
};
