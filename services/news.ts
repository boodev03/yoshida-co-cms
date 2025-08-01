/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all news from the multilingual database with translations
 * @param options Optional parameters for filtering and sorting
 * @returns Array of news data with current language translations
 */
export const getAllNews = async (options?: {
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
            WHERE p.type = 'news'
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
    const news = result.results.map((item: any) => {
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

    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Saves news to the multilingual database
 * @param news The news data to save
 * @param language The language for the translations (default: 'ja')
 * @returns The ID of the saved news
 */
export const saveNews = async (
  news: Product,
  language: string = "ja"
): Promise<number> => {
  try {
    const db = await createDatabaseConnection();
    const now = new Date().toISOString(); // Use ISO string for consistent timestamp format
    const sectionsJson = JSON.stringify(news.sections || []);

    if (news.id) {
      // Build dynamic SET clause for posts table update
      const postSetFields = [];
      if (news.thumbnail) postSetFields.push(`thumbnail = "${news.thumbnail}"`);
      if (news.ogImage) postSetFields.push(`ogImage = "${news.ogImage}"`);
      if (news.ogTwitter) postSetFields.push(`ogTwitter = "${news.ogTwitter}"`);
      if (news.date) postSetFields.push(`date = "${news.date}"`);
      postSetFields.push(`updatedAt = "${now}"`); // Always include updatedAt

      if (postSetFields.length > 0) {
        // Update existing news in posts table
        await db.execute(
          `UPDATE posts SET type = "${
            news.type || "news"
          }", ${postSetFields.join(", ")} WHERE id = ${news.id}`
        );
      }

      // Check if translation exists for this post and language
      const existingTranslation = await db.execute(
        `SELECT id FROM post_translations WHERE post_id = ${news.id} AND language_code = "${language}"`
      );

      if (existingTranslation.results.length > 0) {
        // Build dynamic SET clause for translation update
        const translationSetFields = [];
        if (news.category)
          translationSetFields.push(`category = "${news.category}"`);
        if (news.title) translationSetFields.push(`title = "${news.title}"`);
        if (news.cardDescription)
          translationSetFields.push(
            `cardDescription = "${news.cardDescription}"`
          );
        if (news.sections)
          translationSetFields.push(`sections = '${sectionsJson}'`);
        if (news.metaTitle)
          translationSetFields.push(`metaTitle = "${news.metaTitle}"`);
        if (news.metaKeywords)
          translationSetFields.push(`metaKeywords = "${news.metaKeywords}"`);
        if (news.metaDescription)
          translationSetFields.push(
            `metaDescription = "${news.metaDescription}"`
          );
        translationSetFields.push(`updatedAt = "${now}"`); // Always include updatedAt

        if (translationSetFields.length > 0) {
          // Update existing translation
          await db.execute(
            `UPDATE post_translations SET ${translationSetFields.join(
              ", "
            )} WHERE post_id = ${news.id} AND language_code = "${language}"`
          );
        }
      } else {
        // Build dynamic INSERT for translation
        const fields = ["post_id", "language_code"];
        const values = [news.id, `"${language}"`];
        if (news.category) {
          fields.push("category");
          values.push(`"${news.category}"`);
        }
        if (news.title) {
          fields.push("title");
          values.push(`"${news.title}"`);
        }
        if (news.cardDescription) {
          fields.push("cardDescription");
          values.push(`"${news.cardDescription}"`);
        }
        if (news.sections) {
          fields.push("sections");
          values.push(`'${sectionsJson}'`);
        }
        if (news.metaTitle) {
          fields.push("metaTitle");
          values.push(`"${news.metaTitle}"`);
        }
        if (news.metaKeywords) {
          fields.push("metaKeywords");
          values.push(`"${news.metaKeywords}"`);
        }
        if (news.metaDescription) {
          fields.push("metaDescription");
          values.push(`"${news.metaDescription}"`);
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

      return news.id;
    } else {
      // Create new news (let database auto-generate INTEGER id)
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
          news.type || "news",
          news.thumbnail || "",
          news.ogImage || "",
          news.ogTwitter || "",
          news.date || "",
          news.createdAt || now,
          now,
        ]
      );

      // Get the auto-generated ID
      const postId = result.meta.last_row_id as number;

      // Build dynamic INSERT for translation
      const fields = ["post_id", "language_code"];
      const values = [postId, `"${language}"`];
      if (news.category) {
        fields.push("category");
        values.push(`"${news.category}"`);
      }
      if (news.title) {
        fields.push("title");
        values.push(`"${news.title}"`);
      }
      if (news.cardDescription) {
        fields.push("cardDescription");
        values.push(`"${news.cardDescription}"`);
      }
      if (news.sections) {
        fields.push("sections");
        values.push(`'${sectionsJson}'`);
      }
      if (news.metaTitle) {
        fields.push("metaTitle");
        values.push(`"${news.metaTitle}"`);
      }
      if (news.metaKeywords) {
        fields.push("metaKeywords");
        values.push(`"${news.metaKeywords}"`);
      }
      if (news.metaDescription) {
        fields.push("metaDescription");
        values.push(`"${news.metaDescription}"`);
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
    console.error("Error saving news:", error);
    throw error;
  }
};

/**
 * Fetches news from the multilingual database with translations
 * @param id The ID of the news to fetch
 * @param language The language for translations (default: 'ja')
 * @returns The news data with translations
 */
export const getNews = async (
  id: string,
  language: string = "ja"
): Promise<Product | null> => {
  try {
    const db = await createDatabaseConnection();

    const result = await db.execute(
      `
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
            WHERE p.id = ? AND p.type = 'news'
        `,
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
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Deletes a news item from the multilingual database by ID
 * @param newsId The ID of the news to delete
 * @returns Promise that resolves when the news is deleted
 */
export const deleteNews = async (newsId: number): Promise<void> => {
  try {
    const db = await createDatabaseConnection();

    // Delete from posts table (cascading deletes will handle translations)
    await db.execute("DELETE FROM posts WHERE id = ? AND type = ?", [
      newsId,
      "news",
    ]);
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
};

/**
 * Fetches all unique categories for news
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
