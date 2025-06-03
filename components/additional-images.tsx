/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores/product-detail";
import { toast } from "sonner";

export default function AdditionalImages() {
  const { product, updateField } = useProductStore();
  const { additionalImages = [] } = product;

  const handleAddAdditionalImage = () => {
    const newImages = [...additionalImages, { src: "", alt: "" }];
    updateField("additionalImages", newImages);
  };

  const handleUpdateAdditionalImage = (
    index: number,
    field: "src" | "alt",
    value: string
  ) => {
    const newImages = [...additionalImages];
    newImages[index][field] = value;
    updateField("additionalImages", newImages);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    updateField("additionalImages", newImages);
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
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert to base64 and store directly
        const base64Image = await convertToBase64(file);
        handleUpdateAdditionalImage(index, "src", base64Image);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast.error("Failed to process image");
      }
    }
  };

  // const handleFileUpload = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   index: number
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     try {
  //       // Show temporary preview while uploading
  //       const reader = new FileReader();
  //       reader.onload = (event) => {
  //         const result = event.target?.result as string;
  //         handleUpdateAdditionalImage(index, "src", result);
  //       };
  //       reader.readAsDataURL(file);

  //       // Upload the file and get permanent URL
  //       const downloadURL = await uploadFile({
  //         file,
  //         type: "image",
  //         path: "products",
  //       });

  //       // Update with the permanent URL from Firebase
  //       handleUpdateAdditionalImage(index, "src", downloadURL);
  //     } catch (error) {
  //       console.error("Error uploading image:", error);
  //       toast.error("Failed to upload image");
  //     }
  //   }
  // };

  return (
    <div className="mt-8 md:mt-16">
      <h3 className="text-lg font-medium mb-4">Additional Images</h3>
      <div className="mb-4">
        <Button
          onClick={handleAddAdditionalImage}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          Add Image
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {additionalImages.map((image, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-md p-4 space-y-2"
          >
            <Input
              type="text"
              value={image.alt}
              onChange={(e) =>
                handleUpdateAdditionalImage(index, "alt", e.target.value)
              }
              placeholder="Image Alt Text"
              className="mb-2 transition-colors border border-gray-300 shadow-sm"
            />
            <div className="aspect-video relative group">
              {image.src ? (
                <>
                  <img
                    src={image.src}
                    alt={image.alt || "Image preview"}
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadAsBase64(e, index)}
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
                      onChange={(e) => handleFileUploadAsBase64(e, index)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleRemoveAdditionalImage(index)}
              variant="destructive"
              size="sm"
              className="mt-2 w-full"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
