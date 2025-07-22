"use client";

import { Input } from "@/components/ui/input";
import { uploadFile, deleteFile } from "@/services/upload";
import { useProductStore } from "@/stores/product-detail";
import { useState } from "react";
import { toast } from "sonner";

export default function Video() {
  const { product, updateVideoData } = useProductStore();
  const [isUploading, setIsUploading] = useState(false);

  const videoSection = product?.sections?.find(
    (section) => section.type === "video"
  );
  const videoUrl = videoSection?.data?.url || "";
  const videoTitle = videoSection?.data?.title || "";

  const handleChange = (
    field: keyof { url: string; title?: string },
    value: string
  ) => {
    if (videoSection) {
      updateVideoData(videoSection.id, { [field]: value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoSection) {
      try {
        setIsUploading(true);

        // Create blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);
        handleChange("url", blobUrl);

        // Upload file to R2
        const publicUrl = await uploadFile({
          file,
          type: "video"
        });

        // Remove old video from bucket if exists
        if (
          videoUrl &&
          !videoUrl.startsWith("blob:") &&
          videoSection?.data?.path
        ) {
          try {
            await deleteFile(videoSection.data.path);
          } catch (error) {
            console.warn("Failed to remove old video:", error);
          }
        }

        // Revoke blob URL and set new URL
        URL.revokeObjectURL(blobUrl);
        updateVideoData(videoSection.id, { url: publicUrl });

        toast.success("Video uploaded successfully");
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error("Failed to upload video");

        // Revert to original URL if upload fails
        if (videoUrl && videoUrl.startsWith("blob:")) {
          URL.revokeObjectURL(videoUrl);
          handleChange("url", "");
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="mt-12 md:mt-20">
      <h3 className="text-lg font-medium mb-4">Video</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Video Title (Optional)
          </label>
          <Input
            type="text"
            value={videoTitle}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter video title..."
            className="w-full"
          />
        </div>
        <div className="relative aspect-video md:mx-[96px] my-8 md:my-16">
          {videoUrl ? (
            <div className="relative h-full w-full group">
              <video src={videoUrl} controls className="h-full w-full">
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-white text-black py-1 px-3 rounded-sm text-sm">
                  {isUploading ? "Uploading..." : "Replace Video"}
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="flex flex-col items-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    <span className="text-sm">Uploading video...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-sm relative">
              <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                <span>
                  {isUploading ? "Uploading..." : "Click to upload video"}
                </span>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <div className="flex flex-col items-center text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
                    <span className="text-sm">Uploading video...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
