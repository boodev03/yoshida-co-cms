import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/configs/firebase.config";

const storage = getStorage(app);

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

        // Create storage reference
        const storageRef = ref(storage, `${path}/${type}s/${uniqueFilename}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
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
