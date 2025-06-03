/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductStore } from "@/stores/product-detail";
import { toast } from "sonner";
import AdditionalImages from "./additional-images";

export default function ProductMainContent() {
  const { product, updateField } = useProductStore();
  const {
    imageUrl = "",
    description = "",
    fullWidthImage = "",
    fullWidthDescription = "",
  } = product;

  const handleChange = (field: string, value: string) => {
    updateField(field as any, value);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUploadAsBase64 = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageField: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert and store as base64
        const base64Image = await convertToBase64(file);
        handleChange(imageField, base64Image);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast.error("Failed to process image");
      }
    }
  };

  // const handleFileUpload = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   imageField: string
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     try {
  //       // Show temporary preview while uploading
  //       const reader = new FileReader();
  //       reader.onload = (event) => {
  //         const result = event.target?.result as string;
  //         handleChange(imageField, result);
  //       };
  //       reader.readAsDataURL(file);

  //       // Upload the file and get permanent URL
  //       const downloadURL = await uploadFile({
  //         file,
  //         type: "image",
  //         path: "products",
  //       });

  //       // Update with the permanent URL from Firebase
  //       handleChange(imageField, downloadURL);
  //     } catch (error) {
  //       console.error("Error uploading image:", error);
  //       toast.error("Failed to upload image");
  //     }
  //   }
  // };

  return (
    <div className="mt-12 md:mt-20">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="aspect-video relative md:w-1/2">
          <div className="h-full w-full relative">
            <div className="relative size-full group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Image preview"
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUploadAsBase64(e, "imageUrl")
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                    <span>Click to upload image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadAsBase64(e, "imageUrl")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <Textarea
            value={description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter product description"
            className="min-h-[200px] transition-colors border border-gray-300 shadow-sm h-full"
          />
        </div>
      </div>

      {/* Additional Images Section */}
      <AdditionalImages />

      {/* Full Width Image and Description */}
      <div className="mt-8 md:mt-16">
        <h3 className="text-lg font-medium mb-4">Full Width Content</h3>
        <div className="space-y-6">
          <div className="relative aspect-video md:mx-[96px] my-8 md:my-16">
            <div className="relative h-full w-full mt-2 group">
              {fullWidthImage ? (
                <>
                  <img
                    src={fullWidthImage}
                    alt="Full width preview"
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUploadAsBase64(e, "fullWidthImage")
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                    <span>Click to upload image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUploadAsBase64(e, "fullWidthImage")
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div>
            <Textarea
              value={fullWidthDescription}
              onChange={(e) =>
                handleChange("fullWidthDescription", e.target.value)
              }
              placeholder="Enter full width description"
              className="min-h-[200px] transition-colors border border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
