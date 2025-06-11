/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores/product-detail";

export default function Video() {
  const { updateField } = useProductStore();
  // const { videoUrl = "" } = product;
  const videoUrl = "";

  const handleChange = (field: string, value: string) => {
    updateField(field as any, value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleChange("videoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-12 md:mt-20">
      <h3 className="text-lg font-medium mb-4">Video</h3>
      <div className="space-y-6">
        <div className="relative aspect-video md:mx-[96px] my-8 md:my-16">
          {videoUrl ? (
            <div className="relative h-full w-full group">
              <video src={videoUrl} controls className="h-full w-full">
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                  Replace Video
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                <span>Click to upload video</span>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
