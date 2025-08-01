/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all equipment from the multilingual database with translations
 * @param options Optional parameters for filtering and sorting
 * @returns Array of equipment data with current language translations
 */
export const getAllEquipment = async (options?: {
  category?: string;
  sort?: "latest";
  limit?: number;
  searchTitle?: string;
  language?: string;
  type?: "cases" | "news" | "equipments";
}): Promise<Product[]> => {
  try {
    const db = await createDatabaseConnection();
    const language = options?.language || "ja"; // Default to Japanese

    let query = `
            SELECT 
                p.id,
                p.type,
                p.thumbnail,
                p.ogImage,
                p.ogTwitter,
                p.date,
                p.createdAt,
                p.updatedAt,
                pt.category,
                pt.title,
                pt.cardDescription,
                pt.sections,
                pt.metaTitle,
                pt.metaKeywords,
                pt.metaDescription
            FROM posts p
            LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language_code = ?
            WHERE p.type = 'equipments'
        `;
    const params: any[] = [language];

    // Apply category filter if specified
    if (options?.category) {
      query += " AND pt.category LIKE ?";
      params.push(`%${options.category}%`);
    }

    // Apply title search if specified
    if (options?.searchTitle) {
      query += " AND pt.title LIKE ?";
      params.push(`%${options.searchTitle}%`);
    }

    // Apply sorting - we only sort by updatedAt now
    if (options?.sort === "latest" || !options?.sort) {
      query += " ORDER BY p.updatedAt DESC";
    }

    // Apply limit if specified
    if (options?.limit) {
      query += " LIMIT ?";
      params.push(options.limit);
    }

    const result = await db.execute(query, params);
    const equipment = result.results.map((item: any) => {
      // Parse sections if they're stored as a string
      if (typeof item.sections === "string") {
        try {
          item.sections = JSON.parse(item.sections);
        } catch {
          item.sections = [];
        }
      }
      return {
        id: item.id,
        type: item.type,
        category: item.category || "",
        thumbnail: item.thumbnail || "",
        sections: item.sections || [],
        ogImage: item.ogImage || "",
        ogTwitter: item.ogTwitter || "",
        date: item.date || "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        title: item.title || "",
        cardDescription: item.cardDescription || "",
        metaTitle: item.metaTitle || "",
        metaKeywords: item.metaKeywords || "",
        metaDescription: item.metaDescription || "",
      } as Product;
    });

    return equipment;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

/**
 * Saves equipment to the multilingual database
 * @param equipment The equipment data to save
 * @param language The language for the translation
 * @returns The ID of the saved equipment
 */
export const saveEquipment = async (
  equipment: Product,
  language: string = "ja"
): Promise<number> => {
  try {
    const db = await createDatabaseConnection();
    const now = new Date().toISOString(); // Use ISO string for consistent timestamp format
    const sectionsJson = JSON.stringify(equipment.sections || []);

    if (equipment.id) {
      // Build dynamic SET clause for posts table update
      const postSetFields = [];
      if (equipment.thumbnail)
        postSetFields.push(`thumbnail = "${equipment.thumbnail}"`);
      if (equipment.ogImage)
        postSetFields.push(`ogImage = "${equipment.ogImage}"`);
      if (equipment.ogTwitter)
        postSetFields.push(`ogTwitter = "${equipment.ogTwitter}"`);
      if (equipment.date) postSetFields.push(`date = "${equipment.date}"`);
      postSetFields.push(`updatedAt = "${now}"`); // Always include updatedAt

      if (postSetFields.length > 0) {
        // Update existing equipment in posts table
        await db.execute(
          `UPDATE posts SET type = "equipments", ${postSetFields.join(
            ", "
          )} WHERE id = ${equipment.id}`
        );
      }

      // Check if translation exists for this post and language
      const existingTranslation = await db.execute(
        `SELECT id FROM post_translations WHERE post_id = ${equipment.id} AND language_code = "${language}"`
      );

      if (existingTranslation.results.length > 0) {
        // Build dynamic SET clause for translation update
        const translationSetFields = [];
        if (equipment.category)
          translationSetFields.push(`category = "${equipment.category}"`);
        if (equipment.title)
          translationSetFields.push(`title = "${equipment.title}"`);
        if (equipment.cardDescription)
          translationSetFields.push(
            `cardDescription = "${equipment.cardDescription}"`
          );
        if (equipment.sections)
          translationSetFields.push(`sections = '${sectionsJson}'`);
        if (equipment.metaTitle)
          translationSetFields.push(`metaTitle = "${equipment.metaTitle}"`);
        if (equipment.metaKeywords)
          translationSetFields.push(
            `metaKeywords = "${equipment.metaKeywords}"`
          );
        if (equipment.metaDescription)
          translationSetFields.push(
            `metaDescription = "${equipment.metaDescription}"`
          );
        translationSetFields.push(`updatedAt = "${now}"`); // Always include updatedAt

        if (translationSetFields.length > 0) {
          // Update existing translation
          await db.execute(
            `UPDATE post_translations SET ${translationSetFields.join(
              ", "
            )} WHERE post_id = ${
              equipment.id
            } AND language_code = "${language}"`
          );
        }
      } else {
        // Build dynamic INSERT for translation
        const fields = ["post_id", "language_code"];
        const values = [equipment.id, `"${language}"`];
        if (equipment.category) {
          fields.push("category");
          values.push(`"${equipment.category}"`);
        }
        if (equipment.title) {
          fields.push("title");
          values.push(`"${equipment.title}"`);
        }
        if (equipment.cardDescription) {
          fields.push("cardDescription");
          values.push(`"${equipment.cardDescription}"`);
        }
        if (equipment.sections) {
          fields.push("sections");
          values.push(`'${sectionsJson}'`);
        }
        if (equipment.metaTitle) {
          fields.push("metaTitle");
          values.push(`"${equipment.metaTitle}"`);
        }
        if (equipment.metaKeywords) {
          fields.push("metaKeywords");
          values.push(`"${equipment.metaKeywords}"`);
        }
        if (equipment.metaDescription) {
          fields.push("metaDescription");
          values.push(`"${equipment.metaDescription}"`);
        }
        fields.push("createdAt", "updatedAt");
        values.push(`"${now}"`, `"${now}"`);

        // Insert new translation
        await db.execute(
          `INSERT INTO post_translations (${fields.join(
            ", "
          )}) VALUES (${values.join(", ")})`
        );
      }

      return equipment.id;
    } else {
      // Create new equipment (let database auto-generate INTEGER id)
      const result = await db.execute(
        `INSERT INTO posts (
                    type, 
                    thumbnail, 
                    ogImage, 
                    ogTwitter, 
                    date,
                    createdAt, 
                    updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          "equipments",
          equipment.thumbnail || "",
          equipment.ogImage || "",
          equipment.ogTwitter || "",
          equipment.date || "",
          equipment.createdAt || now,
          now,
        ]
      );

      // Get the auto-generated ID
      const postId = result.meta.last_row_id as number;

      // Build dynamic INSERT for translation
      const fields = ["post_id", "language_code"];
      const values = [postId, `"${language}"`];
      if (equipment.category) {
        fields.push("category");
        values.push(`"${equipment.category}"`);
      }
      if (equipment.title) {
        fields.push("title");
        values.push(`"${equipment.title}"`);
      }
      if (equipment.cardDescription) {
        fields.push("cardDescription");
        values.push(`"${equipment.cardDescription}"`);
      }
      if (equipment.sections) {
        fields.push("sections");
        values.push(`'${sectionsJson}'`);
      }
      if (equipment.metaTitle) {
        fields.push("metaTitle");
        values.push(`"${equipment.metaTitle}"`);
      }
      if (equipment.metaKeywords) {
        fields.push("metaKeywords");
        values.push(`"${equipment.metaKeywords}"`);
      }
      if (equipment.metaDescription) {
        fields.push("metaDescription");
        values.push(`"${equipment.metaDescription}"`);
      }
      fields.push("createdAt", "updatedAt");
      values.push(`"${now}"`, `"${now}"`);

      // Insert translation
      await db.execute(
        `INSERT INTO post_translations (${fields.join(
          ", "
        )}) VALUES (${values.join(", ")})`
      );

      return postId;
    }
  } catch (error) {
    console.error("Error saving equipment:", error);
    throw error;
  }
};

/**
 * Fetches equipment from the multilingual database with translations
 * @param id The ID of the equipment to fetch
 * @param language The language for translations (default: 'ja')
 * @returns The equipment data with translations
 */
export const getEquipment = async (
  id: string,
  language: string = "ja"
): Promise<Product | null> => {
  try {
    const db = await createDatabaseConnection();

    const result = await db.execute(
      `SELECT 
                p.id,
                p.type,
                p.thumbnail,
                p.ogImage,
                p.ogTwitter,
                p.date,
                p.createdAt,
                p.updatedAt,
                pt.category,
                pt.title,
                pt.cardDescription,
                pt.sections,
                pt.metaTitle,
                pt.metaKeywords,
                pt.metaDescription
            FROM posts p
            LEFT JOIN post_translations pt ON p.id = pt.post_id AND pt.language_code = ?
            WHERE p.id = ? AND p.type = 'equipments'`,
      [language, id]
    );

    if (result.results.length > 0) {
      const data = result.results[0] as any;
      // Parse sections if they're stored as a string
      if (typeof data.sections === "string") {
        try {
          data.sections = JSON.parse(data.sections);
        } catch {
          data.sections = [];
        }
      }
      return {
        id: data.id,
        type: data.type,
        category: data.category || "",
        thumbnail: data.thumbnail || "",
        sections: data.sections || [],
        ogImage: data.ogImage || "",
        ogTwitter: data.ogTwitter || "",
        date: data.date || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        title: data.title || "",
        cardDescription: data.cardDescription || "",
        metaTitle: data.metaTitle || "",
        metaKeywords: data.metaKeywords || "",
        metaDescription: data.metaDescription || "",
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

/**
 * Deletes an equipment item from the multilingual database by ID
 * @param equipmentId The ID of the equipment to delete
 * @returns Promise that resolves when the equipment is deleted
 */
export const deleteEquipment = async (equipmentId: number): Promise<void> => {
  try {
    const db = await createDatabaseConnection();

    // Delete from posts table (cascading deletes will handle translations)
    await db.execute("DELETE FROM posts WHERE id = ? AND type = ?", [
      equipmentId,
      "equipments",
    ]);
  } catch (error) {
    console.error("Error deleting equipment:", error);
    throw error;
  }
};

/**
 * Fetches all unique categories for equipment
 * @param type The post type to get categories for
 * @param language The language for getting categories (default: 'ja')
 * @returns Array of unique category strings
 */
export const getCategories = async (
  type: "cases" | "news" | "equipments",
  language: string = "ja"
): Promise<string[]> => {
  try {
    const db = await createDatabaseConnection();

    const query = `
            SELECT DISTINCT pt.category
            FROM posts p
            JOIN post_translations pt ON p.id = pt.post_id 
            WHERE p.type = ? AND pt.language_code = ? AND pt.category IS NOT NULL AND pt.category != ''
            ORDER BY pt.category
        `;

    const result = await db.execute(query, [type, language]);
    return result.results
      .map((item: any) => item.category)
      .filter(Boolean)
      .flatMap((category: string) =>
        category.split(",").map((c: string) => c.trim())
      )
      .filter(
        (category: string, index: number, self: string[]) =>
          self.indexOf(category) === index
      );
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
