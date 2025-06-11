/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SeoConfigProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (seoData: {
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    ogImage: string;
    ogTwitter: string;
  }) => Promise<void>;
  initialData?: {
    metaTitle?: string;
    metaKeywords?: string;
    metaDescription?: string;
    ogImage?: string;
    ogTwitter?: string;
  };
}

export default function SeoConfig({
  open,
  onOpenChange,
  onSave,
  initialData = {},
}: SeoConfigProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [seoData, setSeoData] = useState({
    metaTitle: initialData.metaTitle || "",
    metaKeywords: initialData.metaKeywords || "",
    metaDescription: initialData.metaDescription || "",
    ogImage: initialData.ogImage || "",
    ogTwitter: initialData.ogTwitter || "",
  });

  const handleChange = (field: keyof typeof seoData, value: string) => {
    setSeoData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(seoData);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
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
    imageField: keyof typeof seoData
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SEO Configuration</DialogTitle>
          <DialogDescription>
            Configure the SEO settings for better search engine visibility and
            social sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="metaTitle">
              Meta Title{" "}
              <span className="text-xs text-muted-foreground">
                (50-60 characters ideal)
              </span>
            </Label>
            <Input
              id="metaTitle"
              value={seoData.metaTitle}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              placeholder="Enter page title"
              maxLength={70}
            />
            <p className="text-xs text-muted-foreground">
              {seoData.metaTitle.length}/70 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="metaKeywords">
              Meta Keywords{" "}
              <span className="text-xs text-muted-foreground">
                (comma separated)
              </span>
            </Label>
            <Input
              id="metaKeywords"
              value={seoData.metaKeywords}
              onChange={(e) => handleChange("metaKeywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="metaDescription">
              Meta Description{" "}
              <span className="text-xs text-muted-foreground">
                (150-160 characters ideal)
              </span>
            </Label>
            <Textarea
              id="metaDescription"
              value={seoData.metaDescription}
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              placeholder="Brief description of the page content"
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {seoData.metaDescription.length}/200 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ogImage">
              OG Image{" "}
              <span className="text-xs text-muted-foreground">
                (1200x630px recommended)
              </span>
            </Label>
            <div className="relative h-48 w-full mt-2 group">
              {seoData.ogImage ? (
                <>
                  <img
                    src={seoData.ogImage}
                    alt="OG Image preview"
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadAsBase64(e, "ogImage")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                    <span>Click to upload Facebook/LinkedIn image</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Optimal size is 1200x630 pixels
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadAsBase64(e, "ogImage")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* <div className="grid gap-2">
            <Label htmlFor="ogTwitter">
              Twitter Image{" "}
              <span className="text-xs text-muted-foreground">
                (1200x675px recommended)
              </span>
            </Label>
            <div className="relative h-48 w-full mt-2 group">
              {seoData.ogTwitter ? (
                <>
                  <img
                    src={seoData.ogTwitter}
                    alt="Twitter Image preview"
                    className="object-contain h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-white text-black py-1 px-3 rounded text-sm">
                      Update Image
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUploadAsBase64(e, "ogTwitter")
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                    <span>Click to upload Twitter image</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Optimal aspect ratio is 2:1 (1200x675px)
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadAsBase64(e, "ogTwitter")}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div> */}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save SEO Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
