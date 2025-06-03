/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { Product } from '@/types/product';

interface ProductState {
    product: Product;
    setProduct: (product: Product) => void;
    updateField: (field: keyof Product, value: any) => void;
    updateBulletPoint: (index: number, value: string) => void;
    addBulletPoint: () => void;
    removeBulletPoint: (index: number) => void;
    updateNumberedPoint: (index: number, value: string) => void;
    addNumberedPoint: () => void;
    removeNumberedPoint: (index: number) => void;
}

const initialProduct: Product = {
    // Product Header Fields
    title: '',
    category: '',

    // Product Card Fields
    cardDescription: '',
    thumbnail: '',

    // Product Main Content Fields
    imageUrl: '',
    description: '',
    imageAlt: '',
    additionalImages: [],
    fullWidthImage: '',
    fullWidthImageAlt: '',
    fullWidthDescription: '',

    // Video Component Fields
    videoUrl: '',

    // Title 1 Component Fields
    title1: '',
    description1: '',

    // Title 2 Component Fields
    title2: '',
    description2: '',
    imageUrl2: '',
    imageAlt2: '',

    // Title 3 Component Fields
    title3: '',
    description3: '',

    // Product Links Fields
    bulletPoints: [],
    numberedPoints: [],

    // SEO Fields
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    ogImage: '',
    ogTwitter: ''
};

export const useProductStore = create<ProductState>((set) => ({
    product: initialProduct,

    setProduct: (product: Product) => set({ product }),

    updateField: (field, value) => set((state) => ({
        product: {
            ...state.product,
            [field]: value,
            updatedAt: Date.now()
        }
    })),

    updateBulletPoint: (index, value) => set((state) => {
        const newBulletPoints = [...state.product.bulletPoints];
        newBulletPoints[index] = value;
        return {
            product: {
                ...state.product,
                bulletPoints: newBulletPoints,
                updatedAt: Date.now()
            }
        };
    }),

    addBulletPoint: () => set((state) => ({
        product: {
            ...state.product,
            bulletPoints: [...state.product.bulletPoints, ''],
            updatedAt: Date.now()
        }
    })),

    removeBulletPoint: (index) => set((state) => {
        const newBulletPoints = state.product.bulletPoints.filter((_, i) => i !== index);
        return {
            product: {
                ...state.product,
                bulletPoints: newBulletPoints,
                updatedAt: Date.now()
            }
        };
    }),

    updateNumberedPoint: (index, value) => set((state) => {
        const newNumberedPoints = [...state.product.numberedPoints];
        newNumberedPoints[index] = value;
        return {
            product: {
                ...state.product,
                numberedPoints: newNumberedPoints,
                updatedAt: Date.now()
            }
        };
    }),

    addNumberedPoint: () => set((state) => ({
        product: {
            ...state.product,
            numberedPoints: [...state.product.numberedPoints, ''],
            updatedAt: Date.now()
        }
    })),

    removeNumberedPoint: (index) => set((state) => {
        const newNumberedPoints = state.product.numberedPoints.filter((_, i) => i !== index);
        return {
            product: {
                ...state.product,
                numberedPoints: newNumberedPoints,
                updatedAt: Date.now()
            }
        };
    }),
}));
