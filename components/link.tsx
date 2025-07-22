import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProductStore } from "@/stores/product-detail";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { LinkItem, LinksData } from "../types/product";

interface LinkComponentProps {
  sectionId: string;
}

interface LinkList {
  id: string;
  type: "bullet" | "numbered";
  items: LinkItem[];
}

const LinkComponent: React.FC<LinkComponentProps> = ({ sectionId }) => {
  const { product, updateSection } = useProductStore();
  const [newItemText, setNewItemText] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");

  // Get current section data
  const section = product.sections?.find((s) => s.id === sectionId);
  const linksData = section?.data as LinksData;
  const linkLists = linksData?.linkLists || [];

  const updateLinksData = (updatedLinkLists: LinkList[]) => {
    const newData: LinksData = {
      linkLists: updatedLinkLists,
    };
    updateSection(sectionId, newData);
  };

  const addNewList = (type: "bullet" | "numbered") => {
    const newList: LinkList = {
      id: Date.now().toString(),
      type: type,
      items: [],
    };
    const updatedLinkLists = [...linkLists, newList];
    updateLinksData(updatedLinkLists);
  };

  const removeList = (listId: string) => {
    const updatedLinkLists = linkLists.filter((list) => list.id !== listId);
    updateLinksData(updatedLinkLists);
  };

  const addItemToList = (listId: string) => {
    if (newItemText.trim() && newItemUrl.trim()) {
      const newItem: LinkItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        url: newItemUrl.trim(),
      };

      const updatedLinkLists = linkLists.map((list) =>
        list.id === listId ? { ...list, items: [...list.items, newItem] } : list
      );
      updateLinksData(updatedLinkLists);

      // Clear input fields
      setNewItemText("");
      setNewItemUrl("");
    }
  };

  const removeItemFromList = (listId: string, itemId: string) => {
    const updatedLinkLists = linkLists.map((list) =>
      list.id === listId
        ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
        : list
    );
    updateLinksData(updatedLinkLists);
  };

  const updateItemInList = (
    listId: string,
    itemId: string,
    field: "text" | "url",
    value: string
  ) => {
    const updatedLinkLists = linkLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          }
        : list
    );
    updateLinksData(updatedLinkLists);
  };

  const changeListType = (listId: string, newType: "bullet" | "numbered") => {
    const updatedLinkLists = linkLists.map((list) =>
      list.id === listId ? { ...list, type: newType } : list
    );
    updateLinksData(updatedLinkLists);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-lg">リンクリスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new list buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => addNewList("bullet")}
              className="rounded-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              箇条書きリストを追加
            </Button>
            <Button
              onClick={() => addNewList("numbered")}
              variant="secondary"
              className="rounded-sm border border-gray-300"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              番号付きリストを追加
            </Button>
          </div>

          {/* Display existing lists */}
          {linkLists.map((list) => (
            <Card key={list.id} className="rounded-sm bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <h4 className="text-md font-medium">
                      {list.type === "bullet"
                        ? "箇条書きリスト"
                        : "番号付きリスト"}
                    </h4>
                    {/* List type selector */}
                    <RadioGroup
                      value={list.type}
                      onValueChange={(value) =>
                        changeListType(list.id, value as "bullet" | "numbered")
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="bullet"
                          id={`bullet-${list.id}`}
                        />
                        <Label
                          htmlFor={`bullet-${list.id}`}
                          className="text-sm"
                        >
                          箇条書き
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="numbered"
                          id={`numbered-${list.id}`}
                        />
                        <Label
                          htmlFor={`numbered-${list.id}`}
                          className="text-sm"
                        >
                          番号付き
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button
                    onClick={() => removeList(list.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive rounded-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    リストを削除
                  </Button>
                </div>

                {/* Add item form */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`label-${list.id}`}
                        className="text-sm font-medium"
                      >
                        ラベル
                      </Label>
                      <Input
                        id={`label-${list.id}`}
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="リンクラベルを入力"
                        className="rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`url-${list.id}`}
                        className="text-sm font-medium"
                      >
                        URL
                      </Label>
                      <Input
                        id={`url-${list.id}`}
                        type="url"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="rounded-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => addItemToList(list.id)}
                    size="sm"
                    className="rounded-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    アイテムをリストに追加
                  </Button>
                </div>

                {/* Display list items */}
                {list.items.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      アイテム:
                    </Label>
                    <div className="space-y-2">
                      {list.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2 p-3 bg-background rounded-sm border"
                        >
                          <span className="text-sm font-medium min-w-[20px]">
                            {list.type === "numbered" ? `${index + 1}.` : "•"}
                          </span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              value={item.text}
                              onChange={(e) =>
                                updateItemInList(
                                  list.id,
                                  item.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="ラベル"
                              className="text-sm rounded-sm"
                            />
                            <Input
                              type="url"
                              value={item.url}
                              onChange={(e) =>
                                updateItemInList(
                                  list.id,
                                  item.id,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="URL"
                              className="text-sm rounded-sm"
                            />
                          </div>
                          <Button
                            onClick={() => removeItemFromList(list.id, item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive rounded-sm p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {linkLists.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              まだリンクリストがありません。「箇条書きリストを追加」または「番号付きリストを追加」をクリックして開始してください。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkComponent;
