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
import { uploadFile } from "@/services/supabase-upload";
import { useProductStore } from "@/stores/product-detail";
import { ArrowLeftRight, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo } from "react";
import { TextEditor } from "./text-editor";
import { Input } from "./ui/input";

interface TextContentProps {
  sectionId: string;
  className?: string;
}

export default function TextContent({
  sectionId,
  className,
}: TextContentProps) {
  const { product, updateTextContentData } = useProductStore();

  // Find the current section data
  const currentSection = useMemo(() => {
    if (!sectionId) return null;
    return product.sections?.find(
      (section) => section.id === sectionId && section.type === "text-content"
    );
  }, [product.sections, sectionId]);

  const data = currentSection?.data;
  const title = data?.title || "";
  const content = data?.content || "";
  const titleType = data?.titleType || "h1";
  const image = data?.image;
  const imagePosition = data?.imagePosition;

  const handleTitleChange = (newTitle: string) => {
    updateTextContentData(sectionId, {
      title: newTitle,
    });
  };

  const handleContentChange = (newContent: string) => {
    updateTextContentData(sectionId, {
      content: newContent,
    });
  };

  const handleTitleTypeChange = (newTitleType: "h1" | "h2" | "h3") => {
    updateTextContentData(sectionId, {
      titleType: newTitleType,
    });
  };

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const { publicUrl } = await uploadFile(file);
        const newImage = {
          src: publicUrl,
          alt: file.name,
        };
        updateTextContentData(sectionId, {
          image: newImage,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [sectionId, updateTextContentData]
  );

  const handleImageRemove = useCallback(() => {
    updateTextContentData(sectionId, {
      image: {
        src: "",
        alt: "",
      },
      imagePosition: "" as "left" | "right",
    });
  }, [sectionId, updateTextContentData]);

  const handleImagePositionChange = (position: "left" | "right") => {
    updateTextContentData(sectionId, {
      imagePosition: position,
    });
  };

  const handleImagePositionSwitch = () => {
    const newPosition = imagePosition === "left" ? "right" : "left";
    handleImagePositionChange(newPosition);
  };

  return (
    <Card className={cn("p-4", className)}>
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
                  {image?.src ? (
                    <div className="relative group w-full">
                      <div className="aspect-video rounded-sm overflow-hidden bg-gray-100">
                        <img
                          src={image.src}
                          alt={image?.alt}
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
          <div className={cn("space-y-4", imagePosition ? "w-2/3" : "w-full")}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">タイトルタイプ</Label>
              <div className="flex gap-2">
                <Button
                  variant={titleType === "h1" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTitleTypeChange("h1")}
                  className={cn(
                    "flex-1 rounded-none",
                    titleType === "h1" && "bg-blue-600"
                  )}
                >
                  H1
                </Button>
                <Button
                  variant={titleType === "h2" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTitleTypeChange("h2")}
                  className={cn(
                    "flex-1 rounded-none",
                    titleType === "h2" && "bg-blue-600"
                  )}
                >
                  H2
                </Button>
                <Button
                  variant={titleType === "h3" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTitleTypeChange("h3")}
                  className={cn(
                    "flex-1 rounded-none",
                    titleType === "h3" && "bg-blue-600"
                  )}
                >
                  H3
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">タイトル</Label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="タイトルを入力..."
                className={cn(
                  "transition-colors",
                  titleType === "h1" && "bg-blue-50",
                  titleType === "h2" && "bg-blue-50",
                  titleType === "h3" && "bg-blue-50"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">コンテンツ</Label>
              <TextEditor
                value={content}
                onChange={handleContentChange}
                placeholder="コンテンツを入力..."
              />
            </div>
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
                  {image?.src ? (
                    <div className="relative group w-full">
                      <div className="aspect-video rounded-sm overflow-hidden bg-gray-100">
                        <img
                          src={image.src}
                          alt={image?.alt}
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
