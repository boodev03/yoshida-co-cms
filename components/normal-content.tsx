/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/upload";
import { useProductStore } from "@/stores/product-detail";
import { NormalContentData } from "@/types/product";
import { ArrowLeftRight, Trash2, Upload } from "lucide-react";
import { useMemo } from "react";
import { TextEditor } from "./text-editor";

interface NormalContentProps {
  sectionId?: string;
}

export default function NormalContent({ sectionId }: NormalContentProps) {
  const { product, updateNormalContentData } = useProductStore();

  // Find the current section data
  const currentSection = useMemo(() => {
    if (!sectionId) return null;
    return product.sections?.find(
      (section) => section.id === sectionId && section.type === "normal"
    );
  }, [product.sections, sectionId]);

  const sectionData = (currentSection?.data as NormalContentData) || {};
  const { imagePosition = "", imageUrl, imageAlt, content = "" } = sectionData;

  const handleContentChange = (newContent: string) => {
    if (!sectionId) return;
    updateNormalContentData(sectionId, {
      content: newContent || "",
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!sectionId) return;
    try {
      const publicUrl = await uploadFile({
        file,
        type: "image"
      });
      updateNormalContentData(sectionId, {
        imageUrl: publicUrl,
        imageAlt: file.name,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleImageRemove = () => {
    if (!sectionId) return;
    updateNormalContentData(sectionId, {
      imageUrl: "",
      imageAlt: "",
      imagePosition: "" as "left" | "right" | "top" | "bottom",
    });
  };

  const handleImagePositionChange = (position: "left" | "right") => {
    if (!sectionId) return;
    updateNormalContentData(sectionId, {
      imagePosition: position,
    });
  };

  const handleImagePositionSwitch = () => {
    const newPosition = imagePosition === "left" ? "right" : "left";
    handleImagePositionChange(newPosition);
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-4">
        <div className="flex gap-4">
          {/* Image section - Left */}
          {imagePosition === "left" && (
            <div className="w-1/3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">画像</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleImagePositionSwitch}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    title="右側に移動"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleImageRemove}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="画像を削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-sm p-4">
                <div className="flex flex-col items-center justify-center">
                  {imageUrl ? (
                    <div className="relative group w-full">
                      <div className="aspect-video rounded-sm overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={imageAlt || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">クリックして</span>{" "}
                        画像をアップロード
                      </p>
                      <p className="text-xs text-gray-500">
                        最大10MBまでPNG, JPG, GIF形式
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        id={`image-upload-${imagePosition}`}
                      />
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          document
                            .getElementById(`image-upload-${imagePosition}`)
                            ?.click();
                        }}
                      >
                        画像を選択
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Text content */}
          <div className={cn("space-y-2", imagePosition ? "w-2/3" : "w-full")}>
            <Label className="text-sm font-medium">コンテンツ</Label>
            <TextEditor
              value={content}
              onChange={handleContentChange}
              placeholder="コンテンツを入力..."
            />
          </div>

          {/* Image section - Right */}
          {imagePosition === "right" && (
            <div className="w-1/3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">画像</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleImagePositionSwitch}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    title="左側に移動"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleImageRemove}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="画像を削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-sm p-4">
                <div className="flex flex-col items-center justify-center">
                  {imageUrl ? (
                    <div className="relative group w-full">
                      <div className="aspect-video rounded-sm overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={imageAlt || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">クリックして</span>{" "}
                        画像をアップロード
                      </p>
                      <p className="text-xs text-gray-500">
                        最大10MBまでPNG, JPG, GIF形式
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        id={`image-upload-${imagePosition}`}
                      />
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          document
                            .getElementById(`image-upload-${imagePosition}`)
                            ?.click();
                        }}
                      >
                        画像を選択
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add image button */}
        {!imagePosition && (
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  画像を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>画像の位置を選択</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center gap-4 py-4">
                  <Button
                    variant="outline"
                    onClick={() => handleImagePositionChange("left")}
                  >
                    左側に追加
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleImagePositionChange("right")}
                  >
                    右側に追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
