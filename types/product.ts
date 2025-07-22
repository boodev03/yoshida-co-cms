/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ContentSection {
    id: string;
    type: 'gallery' | 'normal' | 'text-content' | 'video' | 'rich-text' | 'links';
    order: number;
    data: any; // Specific data for each section type
    createdAt: number;
    updatedAt: number;
}

export interface GalleryData {
    rows: Array<{
        id: string;
        images: Array<{
            id: string;
            src: string;
            alt: string;
        }>;
        imagesPerRow: number;
    }>;
}

export interface NormalContentData {
    content: string;
    imageUrl?: string;
    imageAlt?: string;
    imagePosition?: 'left' | 'right' | 'top' | 'bottom';
}

export interface TextContentData {
    title: string;
    content: string;
    titleType?: 'h1' | 'h2' | 'h3';
    image?: {
        src: string;
        alt: string;
        file?: File;
    };
    imagePosition?: 'left' | 'right';
    imageCaption?: string;
}

export interface VideoData {
    url: string;
    title?: string;
}

export interface RichTextData {
    content: string; // TipTap HTML content
}

export interface LinkItem {
    id: string;
    text: string;
    url: string;
}

export interface LinkList {
    id: string;
    type: 'bullet' | 'numbered';
    items: LinkItem[];
}

export interface LinksData {
    linkLists: LinkList[];
}

export interface Product {
    id?: string;

    // Basic Product Info
    title: string;
    category: string;
    cardDescription: string;
    thumbnail: string;

    // Flexible Content Sections (ordered)
    sections: ContentSection[];

    // SEO Fields
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    ogImage: string;
    ogTwitter: string;

    // Timestamps
    createdAt?: number;
    updatedAt?: number;
}
