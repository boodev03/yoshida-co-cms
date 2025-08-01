/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ContentSection {
  id: string;
  type: "gallery" | "normal" | "text-content" | "video" | "rich-text" | "links";
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
  imagePosition?: "left" | "right" | "top" | "bottom";
}

export interface TextContentData {
  title: string;
  content: string;
  titleType?: "h1" | "h2" | "h3";
  image?: {
    src: string;
    alt: string;
    file?: File;
  };
  imagePosition?: "left" | "right";
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
  type: "bullet" | "numbered";
  items: LinkItem[];
}

export interface LinksData {
  linkLists: LinkList[];
}

// Category types
export interface Category {
  id: string;
  type: "cases" | "news" | "equipments";
  createdAt: number;
  updatedAt: number;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  category_name: string;
  createdAt: number;
  updatedAt: number;
}

// Post translation types
export interface PostTranslation {
  id: string;
  post_id: string;
  language_code: string;
  title: string;
  cardDescription: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  createdAt: number;
  updatedAt: number;
}

// Updated Product interface for multilingual support
export interface Product {
  id: number;
  type: "cases" | "news" | "equipments";
  category: string; // category as comma-separated string for multiple categories
  thumbnail: string;
  sections: ContentSection[];
  ogImage: string;
  ogTwitter: string;
  date: string; // Date field for post date
  createdAt?: number;
  updatedAt?: number;

  // Translations (populated based on current language)
  title?: string;
  cardDescription?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

// For working with multilingual data
export interface ProductWithTranslations
  extends Omit<
    Product,
    | "title"
    | "cardDescription"
    | "metaTitle"
    | "metaKeywords"
    | "metaDescription"
  > {
  translations: PostTranslation[];
  categoryTranslations: CategoryTranslation[];
}
