"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores/product-detail";

export default function ProductLinks() {
  const {
    product,
    updateBulletPoint,
    addBulletPoint,
    removeBulletPoint,
    updateNumberedPoint,
    addNumberedPoint,
    removeNumberedPoint,
  } = useProductStore();

  const { bulletPoints, numberedPoints } = product;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden mx-auto my-6 md:my-8">
        <div className="mb-2">
          <p>Links</p>
        </div>

        <ul className="list-disc list-inside pl-2">
          {bulletPoints &&
            bulletPoints.map((item, index) => (
              <li
                key={`bullet-${index}`}
                className="text-jp-p2 font-normal text-black flex items-center"
              >
                <Input
                  value={item}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  placeholder="Bullet point"
                  className="ml-2 flex-grow"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBulletPoint(index)}
                  className="ml-2 p-1 h-8 w-8"
                >
                  ✕
                </Button>
              </li>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addBulletPoint}
            className="mt-2"
          >
            + Add Bullet Point
          </Button>
        </ul>

        <ol className="list-decimal list-inside pl-2 mt-4">
          {numberedPoints &&
            numberedPoints.map((item, index) => (
              <li
                key={`number-${index}`}
                className="text-jp-p2 font-normal text-black flex items-center"
              >
                <Input
                  value={item}
                  onChange={(e) => updateNumberedPoint(index, e.target.value)}
                  placeholder="Numbered point"
                  className="ml-2 flex-grow"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNumberedPoint(index)}
                  className="ml-2 p-1 h-8 w-8"
                >
                  ✕
                </Button>
              </li>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addNumberedPoint}
            className="mt-2"
          >
            + Add Numbered Point
          </Button>
        </ol>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block my-6 md:my-8">
        <div className="mb-2">
          <p>Links</p>
        </div>

        <ul className="list-disc list-inside pl-2 space-y-2">
          {bulletPoints &&
            bulletPoints.map((item, index) => (
              <li
                key={`bullet-desktop-${index}`}
                className="text-jp-p2 font-normal text-black flex items-center"
              >
                <Input
                  value={item}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  placeholder="Bullet point"
                  className="ml-2 flex-grow"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBulletPoint(index)}
                  className="ml-2 p-1 h-8 w-8"
                >
                  ✕
                </Button>
              </li>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addBulletPoint}
            className="mt-2"
          >
            + Add Bullet Point
          </Button>
        </ul>

        <ol className="list-decimal list-inside pl-2 mt-4 space-y-2">
          {numberedPoints &&
            numberedPoints.map((item, index) => (
              <li
                key={`number-desktop-${index}`}
                className="text-jp-p2 font-normal text-black flex items-center"
              >
                <Input
                  value={item}
                  onChange={(e) => updateNumberedPoint(index, e.target.value)}
                  placeholder="Numbered point"
                  className="ml-2 flex-grow"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNumberedPoint(index)}
                  className="ml-2 p-1 h-8 w-8"
                >
                  ✕
                </Button>
              </li>
            ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addNumberedPoint}
            className="mt-2"
          >
            + Add Numbered Point
          </Button>
        </ol>
      </div>
    </>
  );
}
