import { createDatabaseConnection } from "@/configs/database.config";
import { Product } from "@/types/product";

/**
 * Fetches all equipment from the Cloudflare D1 database
 * @param options Optional parameters for filtering and sorting
 * @returns Array of equipment data
 */
export const getAllEquipment = async (options?: {
    category?: string;
    sort?: 'latest';
    limit?: number;
    searchTitle?: string;
}): Promise<Product[]> => {
    try {
        const db = await createDatabaseConnection();
        
        let query = 'SELECT * FROM equipments WHERE 1=1';
        const params: any[] = [];

        // Apply category filter if specified
        if (options?.category) {
            query += ' AND category = ?';
            params.push(options.category);
        }

        // Apply title search if specified
        if (options?.searchTitle) {
            query += ' AND title LIKE ?';
            params.push(`%${options.searchTitle}%`);
        }

        // Apply sorting - we only sort by updatedAt now
        if (options?.sort === 'latest' || !options?.sort) {
            query += ' ORDER BY updatedAt DESC';
        }

        // Apply limit if specified
        if (options?.limit) {
            query += ' LIMIT ?';
            params.push(options.limit);
        }

        const result = await db.execute(query, params);
        const equipment = result.results.map((item: any) => {
            // Parse sections if they're stored as a string
            if (typeof item.sections === 'string') {
                try {
                    item.sections = JSON.parse(item.sections);
                } catch {
                    item.sections = [];
                }
            }
            // Ensure all fields have default values
            return {
                ...item,
                cardDescription: item.cardDescription || '',
                thumbnail: item.thumbnail || '',
                sections: item.sections || [],
                metaTitle: item.metaTitle || '',
                metaKeywords: item.metaKeywords || '',
                metaDescription: item.metaDescription || '',
                ogImage: item.ogImage || '',
                ogTwitter: item.ogTwitter || ''
            };
        });

        return equipment as Product[];
    } catch (error) {
        console.error("Error fetching equipment:", error);
        throw error;
    }
};

/**
 * Saves equipment to the Cloudflare D1 database
 * @param equipment The equipment data to save
 * @returns The ID of the saved equipment
 */
export const saveEquipment = async (equipment: Product): Promise<string> => {
    try {
        const db = await createDatabaseConnection();
        const now = Date.now();
        const sectionsJson = JSON.stringify(equipment.sections || []);

        if (equipment.id) {
            // Update existing equipment
            await db.execute(
                `UPDATE equipments SET 
                    title = ?, 
                    category = ?, 
                    cardDescription = ?, 
                    thumbnail = ?, 
                    sections = ?, 
                    metaTitle = ?, 
                    metaKeywords = ?, 
                    metaDescription = ?, 
                    ogImage = ?, 
                    ogTwitter = ?, 
                    updatedAt = ? 
                WHERE id = ?`,
                [
                    equipment.title,
                    equipment.category,
                    equipment.cardDescription || '',
                    equipment.thumbnail || '',
                    sectionsJson,
                    equipment.metaTitle || '',
                    equipment.metaKeywords || '',
                    equipment.metaDescription || '',
                    equipment.ogImage || '',
                    equipment.ogTwitter || '',
                    now,
                    equipment.id
                ]
            );
            return equipment.id;
        } else {
            // Create new equipment
            const result = await db.execute(
                `INSERT INTO equipments (
                    title, 
                    category, 
                    cardDescription, 
                    thumbnail, 
                    sections, 
                    metaTitle, 
                    metaKeywords, 
                    metaDescription, 
                    ogImage, 
                    ogTwitter, 
                    createdAt, 
                    updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
                [
                    equipment.title,
                    equipment.category,
                    equipment.cardDescription || '',
                    equipment.thumbnail || '',
                    sectionsJson,
                    equipment.metaTitle || '',
                    equipment.metaKeywords || '',
                    equipment.metaDescription || '',
                    equipment.ogImage || '',
                    equipment.ogTwitter || '',
                    equipment.createdAt || now,
                    now
                ]
            );
            return result.results[0].id as string;
        }
    } catch (error) {
        console.error("Error saving equipment:", error);
        throw error;
    }
};

/**
 * Fetches equipment from the Cloudflare D1 database
 * @param id The ID of the equipment to fetch
 * @returns The equipment data
 */
export const getEquipment = async (id: string): Promise<Product | null> => {
    try {
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'SELECT * FROM equipments WHERE id = ?',
            [id]
        );

        if (result.results.length > 0) {
            const data = result.results[0] as any;
            // Parse sections if they're stored as a string
            if (typeof data.sections === 'string') {
                try {
                    data.sections = JSON.parse(data.sections);
                } catch {
                    data.sections = [];
                }
            }
            // Ensure all required fields have default values
            return {
                id: data.id,
                title: data.title || '',
                category: data.category || '',
                cardDescription: data.cardDescription || '',
                thumbnail: data.thumbnail || '',
                sections: data.sections || [],
                metaTitle: data.metaTitle || '',
                metaKeywords: data.metaKeywords || '',
                metaDescription: data.metaDescription || '',
                ogImage: data.ogImage || '',
                ogTwitter: data.ogTwitter || '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
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
 * Deletes an equipment item from the Cloudflare D1 database by ID
 * @param equipmentId The ID of the equipment to delete
 * @returns Promise that resolves when the equipment is deleted
 */
export const deleteEquipment = async (equipmentId: string): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        
        await db.execute(
            'DELETE FROM equipments WHERE id = ?',
            [equipmentId]
        );
    } catch (error) {
        console.error("Error deleting equipment:", error);
        throw error;
    }
};
