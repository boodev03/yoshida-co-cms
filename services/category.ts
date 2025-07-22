import { createDatabaseConnection } from "@/configs/database.config";

export interface Category {
    id?: string;
    category_name: string;
    type: 'cases' | 'news' | 'equipments';
    createdAt?: number;
    updatedAt?: number;
}

// Store category into Cloudflare D1
export const saveCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const now = Date.now();
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'INSERT INTO categories (category_name, type, createdAt, updatedAt) VALUES (?, ?, ?, ?) RETURNING id',
            [categoryData.category_name, categoryData.type, now, now]
        );

        const categoryId = result.results[0].id as string;
        console.log('Category saved with ID:', categoryId);
        return categoryId;
    } catch (error) {
        console.error('Error saving category:', error);
        throw new Error('Failed to save category');
    }
};

// List categories by type
export const getCategoriesByType = async (type: Category['type']): Promise<Category[]> => {
    try {
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'SELECT * FROM categories WHERE type = ? ORDER BY category_name ASC',
            [type]
        );

        return result.results as Category[];
    } catch (error) {
        console.error('Error fetching categories by type:', error);
        throw new Error('Failed to fetch categories');
    }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const db = await createDatabaseConnection();
        
        const result = await db.execute(
            'SELECT * FROM categories ORDER BY type ASC, category_name ASC'
        );

        return result.results as Category[];
    } catch (error) {
        console.error('Error fetching all categories:', error);
        throw new Error('Failed to fetch categories');
    }
};

// Update category
export const updateCategory = async (categoryId: string, updateData: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        const now = Date.now();
        
        const fields: string[] = [];
        const values: any[] = [];
        
        if (updateData.category_name) {
            fields.push('category_name = ?');
            values.push(updateData.category_name);
        }
        
        if (updateData.type) {
            fields.push('type = ?');
            values.push(updateData.type);
        }
        
        fields.push('updatedAt = ?');
        values.push(now);
        values.push(categoryId);

        await db.execute(
            `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        console.log('Category updated successfully:', categoryId);
    } catch (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
    }
};

// Delete category
export const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
        const db = await createDatabaseConnection();
        
        await db.execute(
            'DELETE FROM categories WHERE id = ?',
            [categoryId]
        );
        
        console.log('Category deleted successfully:', categoryId);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
};
