export interface Product {
    id?: string;
    // Product Header Fields
    title: string;
    category: string;

    // Product Card Fields
    cardDescription: string;
    thumbnail: string;

    // Product Main Content Fields
    imageUrl: string;
    description: string;
    imageAlt: string;
    additionalImages: Array<{ src: string; alt: string }>;
    fullWidthImage: string;
    fullWidthImageAlt: string;
    fullWidthDescription: string;

    // Video Component Fields
    videoUrl: string;

    // Title 1 Component Fields
    title1: string;
    description1: string;

    // Title 2 Component Fields
    title2: string;
    description2: string;
    imageUrl2: string;
    imageAlt2: string;

    // Title 3 Component Fields
    title3: string;
    description3: string;

    // Product Links Fields
    bulletPoints: string[];
    numberedPoints: string[];

    // SEO Fields
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    ogImage: string;
    ogTwitter: string;

    // Timestamps for database
    createdAt?: number;
    updatedAt?: number;
}
