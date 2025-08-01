/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { Product, ContentSection, GalleryData, NormalContentData, TextContentData, VideoData, RichTextData } from '@/types/product';

interface ProductState {
    product: Product;
    setProduct: (product: Product) => void;
    updateField: (field: keyof Omit<Product, 'sections'>, value: any) => void;

    // Section Management
    addSection: (type: ContentSection['type'], data?: any) => void;
    removeSection: (sectionId: string) => void;
    updateSection: (sectionId: string, data: any) => void;
    reorderSections: (sections: ContentSection[]) => void;
    moveSectionUp: (sectionId: string) => void;
    moveSectionDown: (sectionId: string) => void;

    // Section Data Updates
    updateGalleryData: (sectionId: string, data: Partial<GalleryData>) => void;
    updateNormalContentData: (sectionId: string, data: Partial<NormalContentData>) => void;
    updateTextContentData: (sectionId: string, data: Partial<TextContentData>) => void;
    updateVideoData: (sectionId: string, data: Partial<VideoData>) => void;
    updateRichTextData: (sectionId: string, data: Partial<RichTextData>) => void;
}

const initialProduct: Product = {
    id: 0, // Add id field
    title: '',
    category: '',
    cardDescription: '',
    thumbnail: '',
    sections: [],
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    ogImage: '',
    ogTwitter: '',
    date: '',
    type: 'cases'
};

export const useProductStore = create<ProductState>((set) => ({
    product: initialProduct,

    setProduct: (product: Product) => set({ product: { ...product, sections: product.sections || [] } }),

    updateField: (field, value) => set((state) => ({
        product: {
            ...state.product,
            [field]: value,
            updatedAt: Date.now()
        }
    })),

    addSection: (type, data = {}) => set((state) => {
        const currentSections = state.product.sections || [];
        const newSection: ContentSection = {
            id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type,
            order: currentSections.length,
            data: getDefaultDataForType(type, data),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        return {
            product: {
                ...state.product,
                sections: [...currentSections, newSection],
                updatedAt: Date.now()
            }
        };
    }),

    removeSection: (sectionId) => set((state) => {
        const currentSections = state.product.sections || [];
        const filteredSections = currentSections.filter(s => s.id !== sectionId);
        // Reorder remaining sections
        const reorderedSections = filteredSections.map((section, index) => ({
            ...section,
            order: index,
            updatedAt: Date.now()
        }));

        return {
            product: {
                ...state.product,
                sections: reorderedSections,
                updatedAt: Date.now()
            }
        };
    }),

    updateSection: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId
                        ? { ...section, data: { ...section.data, ...data }, updatedAt: Date.now() }
                        : section
                ),
                updatedAt: Date.now()
            }
        };
    }),

    reorderSections: (sections) => set((state) => {
        const reorderedSections = (sections || []).map((section, index) => ({
            ...section,
            order: index,
            updatedAt: Date.now()
        }));

        return {
            product: {
                ...state.product,
                sections: reorderedSections,
                updatedAt: Date.now()
            }
        };
    }),

    moveSectionUp: (sectionId) => set((state) => {
        const currentSections = state.product.sections || [];
        const sections = [...currentSections].sort((a, b) => a.order - b.order);
        const currentIndex = sections.findIndex(s => s.id === sectionId);

        if (currentIndex > 0) {
            [sections[currentIndex], sections[currentIndex - 1]] = [sections[currentIndex - 1], sections[currentIndex]];
            const reorderedSections = sections.map((section, index) => ({
                ...section,
                order: index,
                updatedAt: Date.now()
            }));

            return {
                product: {
                    ...state.product,
                    sections: reorderedSections,
                    updatedAt: Date.now()
                }
            };
        }

        return state;
    }),

    moveSectionDown: (sectionId) => set((state) => {
        const currentSections = state.product.sections || [];
        const sections = [...currentSections].sort((a, b) => a.order - b.order);
        const currentIndex = sections.findIndex(s => s.id === sectionId);

        if (currentIndex < sections.length - 1) {
            [sections[currentIndex], sections[currentIndex + 1]] = [sections[currentIndex + 1], sections[currentIndex]];
            const reorderedSections = sections.map((section, index) => ({
                ...section,
                order: index,
                updatedAt: Date.now()
            }));

            return {
                product: {
                    ...state.product,
                    sections: reorderedSections,
                    updatedAt: Date.now()
                }
            };
        }

        return state;
    }),

    // Specific section data update methods
    updateGalleryData: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId && section.type === 'gallery'
                        ? { ...section, data: { ...section.data, ...data }, updatedAt: Date.now() }
                        : section
                ),
                updatedAt: Date.now()
            }
        };
    }),

    updateNormalContentData: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        console.log("data", data);
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId && section.type === 'normal'
                        ? {
                            ...section,
                            data: {
                                ...section.data,
                                ...data
                            },
                        }
                        : section
                ),
            }
        };
    }),

    updateTextContentData: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId && section.type === 'text-content'
                        ? { ...section, data: { ...section.data, ...data } }
                        : section
                ),
            }
        };
    }),

    updateVideoData: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId && section.type === 'video'
                        ? { ...section, data: { ...section.data, ...data }, updatedAt: Date.now() }
                        : section
                ),
            }
        };
    }),

    updateRichTextData: (sectionId, data) => set((state) => {
        const currentSections = state.product.sections || [];
        return {
            product: {
                ...state.product,
                sections: currentSections.map(section =>
                    section.id === sectionId && section.type === 'rich-text'
                        ? { ...section, data: { ...section.data, ...data }, updatedAt: Date.now() }
                        : section
                ),
            }
        };
    }),
}));

// Helper function to get default data for each section type
function getDefaultDataForType(type: ContentSection['type'], initialData: any = {}) {
    const defaults: Record<ContentSection['type'], any> = {
        gallery: { rows: [] },
        normal: { content: '', imagePosition: '', imageUrl: '', imageAlt: '' },
        'text-content': { title: '', content: '', alignment: 'left' },
        video: { url: '', autoplay: false },
        'rich-text': { content: '' },
        links: { items: [] }
    };

    return { ...defaults[type], ...initialData };
}
