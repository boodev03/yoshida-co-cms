/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/supabase-upload";
import { useProductStore } from "@/stores/product-detail";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo } from "react";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

interface GalleryRow {
  id: string;
  images: GalleryImage[];
  imagesPerRow: number;
}

interface GalleryProps {
  sectionId?: string;
  className?: string;
}

export default function Gallery({ sectionId, className }: GalleryProps) {
  const { product, updateGalleryData } = useProductStore();

  // Find the current section data
  const currentSection = useMemo(() => {
    if (!sectionId) return null;
    return product.sections?.find(
      (section) => section.id === sectionId && section.type === "gallery"
    );
  }, [product.sections, sectionId]);

  const sectionData = currentSection?.data || {};
  const { rows = [] } = sectionData;

  const addNewRow = useCallback(() => {
    if (!sectionId) return;

    const newRow: GalleryRow = {
      id: `row-${Date.now()}`,
      images: [],
      imagesPerRow: 3,
    };

    updateGalleryData(sectionId, {
      rows: [...rows, newRow],
    });
  }, [sectionId, rows, updateGalleryData]);

  const updateRowImagesPerRow = useCallback(
    (rowId: string, newImagesPerRow: number) => {
      if (!sectionId) return;

      const updatedRows = rows.map((row: GalleryRow) => {
        if (row.id === rowId) {
          // If reducing images per row, keep only the first N images
          const updatedImages = row.images.slice(0, newImagesPerRow);
          return {
            ...row,
            imagesPerRow: newImagesPerRow,
            images: updatedImages,
          };
        }
        return row;
      });

      updateGalleryData(sectionId, {
        rows: updatedRows,
      });
    },
    [sectionId, rows, updateGalleryData]
  );

  const handleFileUpload = useCallback(
    async (rowId: string, files: FileList | null, imageId?: string) => {
      if (!files || !sectionId) return;

      try {
        // Upload files to Supabase and get URLs
        const newImages = await Promise.all(
          Array.from(files).map(async (file) => {
            const { publicUrl } = await uploadFile(file);
            return {
              id: imageId || `img-${Date.now()}-${Math.random()}`,
              src: publicUrl,
              alt: file.name,
            };
          })
        );

        const updatedRows = rows.map((row: GalleryRow) => {
          if (row.id === rowId) {
            if (imageId) {
              // Replace existing image
              const updatedImages = row.images.map((img) =>
                img.id === imageId ? newImages[0] : img
              );
              return {
                ...row,
                images: updatedImages,
              };
            } else {
              // Add new images
              const availableSlots = row.imagesPerRow - row.images.length;
              const imagesToAdd = newImages.slice(0, availableSlots);
              return {
                ...row,
                images: [...row.images, ...imagesToAdd],
              };
            }
          }
          return row;
        });

        updateGalleryData(sectionId, {
          rows: updatedRows,
        });
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    },
    [sectionId, rows, updateGalleryData]
  );

  const removeImage = useCallback(
    (rowId: string, imageId: string) => {
      if (!sectionId) return;

      const updatedRows = rows.map((row: GalleryRow) => {
        if (row.id === rowId) {
          return {
            ...row,
            images: row.images.filter((img) => img.id !== imageId),
          };
        }
        return row;
      });

      updateGalleryData(sectionId, {
        rows: updatedRows,
      });
    },
    [sectionId, rows, updateGalleryData]
  );

  const removeRow = useCallback(
    (rowId: string) => {
      if (!sectionId) return;

      const updatedRows = rows.filter((row: GalleryRow) => row.id !== rowId);

      updateGalleryData(sectionId, {
        rows: updatedRows,
      });
    },
    [sectionId, rows, updateGalleryData]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ギャラリー</h3>
        <Button onClick={addNewRow} variant="outline" size="sm">
          <ImagePlus className="w-4 h-4 mr-2" />
          新しい行を追加
        </Button>
      </div>

      <div className="space-y-6">
        {rows.map((row: GalleryRow, rowIndex: number) => (
          <Card key={row.id} className="p-4">
            <CardContent className="p-0 space-y-4">
              {/* Row header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">
                    行 {rowIndex + 1}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`images-per-row-${row.id}`}
                      className="text-sm"
                    >
                      1行あたりの画像数:
                    </Label>
                    <Select
                      value={row.imagesPerRow.toString()}
                      onValueChange={(value) =>
                        updateRowImagesPerRow(row.id, parseInt(value))
                      }
                    >
                      <SelectTrigger
                        id={`images-per-row-${row.id}`}
                        className="w-20"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => removeRow(row.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Images grid */}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${row.imagesPerRow}, 1fr)`,
                }}
              >
                {/* Existing images */}
                {row.images.map((image) => (
                  <div key={image.id} className="relative group">
                    {image.src ? (
                      <>
                        <div className="aspect-square rounded-sm overflow-hidden bg-gray-100">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Handle broken image URLs gracefully
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => removeImage(row.id, image.id)}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="aspect-square">
                        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                クリックして
                              </span>{" "}
                              画像をアップロード
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              handleFileUpload(
                                row.id,
                                e.target.files,
                                image.id
                              );
                              // Reset the input value to allow re-uploading the same file
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}

                {/* Upload slots */}
                {Array.from({
                  length: Math.max(0, row.imagesPerRow - row.images.length),
                }).map((_, index) => (
                  <div
                    key={`upload-${row.id}-${index}`}
                    className="aspect-square"
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">クリックして</span>{" "}
                          画像をアップロード
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleFileUpload(row.id, e.target.files);
                          // Reset the input value to allow re-uploading the same file
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>

              {/* Upload info */}
              <div className="text-sm text-gray-500">
                {row.images.filter((img) => img.src).length} /{" "}
                {row.imagesPerRow} 画像が追加されました
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 && (
        <Card className="p-8">
          <CardContent className="p-0 text-center">
            <ImagePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">ギャラリーを作成</h3>
            <p className="text-gray-500 mb-4">
              画像をアップロードして美しいギャラリーを作成しましょう
            </p>
            <Button onClick={addNewRow} variant="outline" size="sm">
              <ImagePlus className="w-4 h-4 mr-2" />
              最初の行を追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
