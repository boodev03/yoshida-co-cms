import { getFirestore, collection, getDocs, query, where, orderBy, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { app } from "@/configs/firebase.config";

const db = getFirestore(app);

export interface Category {
    id?: string;
    category_name: string;
    type: 'cases' | 'news' | 'equipments';
    createdAt?: number;
    updatedAt?: number;
}

// Store category into Firebase
export const saveCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const now = Date.now();
        const docRef = await addDoc(collection(db, 'categories'), {
            ...categoryData,
            createdAt: now,
            updatedAt: now,
        });

        console.log('Category saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving category:', error);
        throw new Error('Failed to save category');
    }
};

// List categories by type
export const getCategoriesByType = async (type: Category['type']): Promise<Category[]> => {
    try {
        const q = query(
            collection(db, 'categories'),
            where('type', '==', type)
        );

        const querySnapshot = await getDocs(q);
        const categories: Category[] = [];

        querySnapshot.forEach((doc) => {
            categories.push({
                id: doc.id,
                ...doc.data()
            } as Category);
        });

        return categories;
    } catch (error) {
        console.error('Error fetching categories by type:', error);
        throw new Error('Failed to fetch categories');
    }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const q = query(
            collection(db, 'categories'),
            orderBy('type', 'asc'),
            orderBy('category_name', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const categories: Category[] = [];

        querySnapshot.forEach((doc) => {
            categories.push({
                id: doc.id,
                ...doc.data()
            } as Category);
        });

        return categories;
    } catch (error) {
        console.error('Error fetching all categories:', error);
        throw new Error('Failed to fetch categories');
    }
};

// Update category
export const updateCategory = async (categoryId: string, updateData: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, {
            ...updateData,
            updatedAt: Date.now(),
        });

        console.log('Category updated successfully:', categoryId);
    } catch (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
    }
};

// Delete category
export const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'categories', categoryId));
        console.log('Category deleted successfully:', categoryId);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
};
