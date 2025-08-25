import { createDatabaseConnection } from "@/configs/database.config";

/**
 * Reorders posts by updating their display_order values using a single batch update
 * @param postIds Array of post IDs in the desired order
 * @param type The type of posts to reorder (cases, news, equipments)
 * @returns Success status
 */
export const reorderPosts = async (
  postIds: number[],
  type: "cases" | "news" | "equipments"
): Promise<boolean> => {
  try {
    const db = await createDatabaseConnection();
    const now = Date.now();

    // Use a single batch update with CASE statement for better performance
    const caseStatements = postIds
      .map((id, index) => `WHEN id = ${id} THEN ${index + 1}`)
      .join(" ");

    const updateQuery = `
      UPDATE posts 
      SET 
        display_order = CASE ${caseStatements} END,
        updatedAt = ${now}
      WHERE id IN (${postIds.join(",")}) AND type = '${type}'
    `;

    await db.execute(updateQuery);

    return true;
  } catch (error) {
    console.error("Error reordering posts:", error);
    throw error;
  }
};

/**
 * Gets the current display order for posts of a specific type
 * @param type The type of posts (cases, news, equipments)
 * @returns Array of post IDs in current display order
 */
export const getPostOrder = async (
  type: "cases" | "news" | "equipments"
): Promise<number[]> => {
  try {
    const db = await createDatabaseConnection();

    const result = await db.execute(
      `SELECT id FROM posts WHERE type = ? ORDER BY display_order ASC, updatedAt DESC`,
      [type]
    );

    return result.results.map((item: any) => item.id);
  } catch (error) {
    console.error("Error getting post order:", error);
    throw error;
  }
};
