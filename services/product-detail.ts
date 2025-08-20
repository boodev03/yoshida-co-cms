/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Saves a product to the multilingual database
 * @param product The product data to save
 * @param language The language for the translations (default: 'ja')
 * @returns The ID of the saved product
 */
export const saveProduct = async (
  product: Product,
  language: string = "ja"
): Promise<number> => {
  try {
    const db = await createDatabaseConnection();
    const now = Date.now();
    const sectionsJson = JSON.stringify(product.sections || []);

    // Check if we're updating an existing product (id exists and is greater than 0)
    if (product.id && product.id > 0) {
      // Update existing product in posts table
      await db.execute(
        `UPDATE posts SET 
                    type = ?, 
                    thumbnail = ?, 
                    ogImage = ?, 
                    ogTwitter = ?, 
                    date = ?,
                    updatedAt = ? 
                WHERE id = ?`,
        [
          product.type || "cases",
          product.thumbnail || "",
          product.ogImage || "",
          product.ogTwitter || "",
          product.date || "",
          now,
          product.id,
        ]
      );

      // Check if translation exists for this post and language
      const existingTranslation = await db.execute(
        `SELECT id FROM post_translations WHERE post_id = ${product.id} AND language_code = "${language}"`
      );

      if (existingTranslation.results.length > 0) {
        // Build dynamic SET clause for non-empty fields
        const setFields = [];
        const now = new Date().toISOString(); // Assuming 'now' is a timestamp

        if (product.category)
          setFields.push(`category = "${product.category}"`);
        if (product.title) setFields.push(`title = "${product.title}"`);
        if (product.cardDescription)
          setFields.push(`cardDescription = "${product.cardDescription}"`);
        if (sectionsJson)
          setFields.push(`sections = '${JSON.stringify(sectionsJson)}'`); // Stringify JSON if needed
        if (product.metaTitle)
          setFields.push(`metaTitle = "${product.metaTitle}"`);
        if (product.metaKeywords)
          setFields.push(`metaKeywords = "${product.metaKeywords}"`);
        if (product.metaDescription)
          setFields.push(`metaDescription = "${product.metaDescription}"`);
        setFields.push(`updatedAt = "${now}"`); // Always include updatedAt

        if (setFields.length > 0) {
          // Update existing translation with only non-empty fields
          await db.execute(
            `UPDATE post_translations SET ${setFields.join(
              ", "
            )} WHERE post_id = ${product.id} AND language_code = "${language}"`
          );
        }
      } else {
        // Build dynamic INSERT for non-empty fields
        const fields = ["post_id", "language_code"];
        const values = [product.id, `"${language}"`];
        const now = new Date().toISOString();

        if (product.category) {
          fields.push("category");
          values.push(`"${product.category}"`);
        }
        if (product.title) {
          fields.push("title");
          values.push(`"${product.title}"`);
        }
        if (product.cardDescription) {
          fields.push("cardDescription");
          values.push(`"${product.cardDescription}"`);
        }
        if (sectionsJson) {
          fields.push("sections");
          values.push(`'${JSON.stringify(sectionsJson)}'`);
        }
        if (product.metaTitle) {
          fields.push("metaTitle");
          values.push(`"${product.metaTitle}"`);
        }
        if (product.metaKeywords) {
          fields.push("metaKeywords");
          values.push(`"${product.metaKeywords}"`);
        }
        if (product.metaDescription) {
          fields.push("metaDescription");
          values.push(`"${product.metaDescription}"`);
        }
        fields.push("createdAt", "updatedAt");
        values.push(`"${now}"`, `"${now}"`);

        // Insert new translation for existing post
        await db.execute(
          `INSERT INTO post_translations (${fields.join(
            ", "
          )}) VALUES (${values.join(", ")})`
        );
      }

      return product.id;
    } else {
      // Create new post (let database auto-generate INTEGER id)
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
          product.type || "cases",
          product.thumbnail || "",
          product.ogImage || "",
          product.ogTwitter || "",
          product.date || "",
          product.createdAt || now,
          now,
        ]
      );

      // Get the auto-generated ID
      const postId = result.meta.last_row_id as number;
      console.log("saveProduct: New post created with ID:", postId);

      // Create translation
      await db.execute(
        `INSERT INTO post_translations (
                    post_id, 
                    language_code, 
                    category,
                    title, 
                    cardDescription, 
                    sections,
                    metaTitle, 
                    metaKeywords, 
                    metaDescription,
                    createdAt,
                    updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          postId, // Now an INTEGER
          language,
          product.category || "",
          product.title || "",
          product.cardDescription || "",
          sectionsJson,
          product.metaTitle || "",
          product.metaKeywords || "",
          product.metaDescription || "",
          now,
          now,
        ]
      );

      return postId;
    }
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};

/**
 * Fetches a product from the multilingual database
 * @param id The ID of the product to fetch
 * @param language The language for the translations (default: 'ja')
 * @returns The product data with translations
 */
export const getProduct = async (
  id: string,
  language: string = "ja"
): Promise<Product | null> => {
  try {
    const db = await createDatabaseConnection();

    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return null;
    }

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
            WHERE p.id = ?`,
      [language, numericId]
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
      // Ensure all required fields have default values
      return {
        id: data.id,
        type: data.type || "cases",
        category: data.category || "",
        thumbnail: data.thumbnail || "",
        sections: typeof data.sections === "string" ? JSON.parse(data.sections) : data.sections || [],
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
    console.error("Error fetching product:", error);
    throw error;
  }
};
