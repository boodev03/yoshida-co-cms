-- Migration script to update existing tables with new structure

-- Drop existing tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS news;  
DROP TABLE IF EXISTS equipments;

-- Recreate tables with new structure
-- Products table
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cardDescription TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    sections TEXT DEFAULT '[]', -- JSON string for ContentSection[]
    metaTitle TEXT DEFAULT '',
    metaKeywords TEXT DEFAULT '',
    metaDescription TEXT DEFAULT '',
    ogImage TEXT DEFAULT '',
    ogTwitter TEXT DEFAULT '',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- News table
CREATE TABLE news (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cardDescription TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    sections TEXT DEFAULT '[]', -- JSON string for ContentSection[]
    metaTitle TEXT DEFAULT '',
    metaKeywords TEXT DEFAULT '',
    metaDescription TEXT DEFAULT '',
    ogImage TEXT DEFAULT '',
    ogTwitter TEXT DEFAULT '',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Equipments table
CREATE TABLE equipments (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cardDescription TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    sections TEXT DEFAULT '[]', -- JSON string for ContentSection[]
    metaTitle TEXT DEFAULT '',
    metaKeywords TEXT DEFAULT '',
    metaDescription TEXT DEFAULT '',
    ogImage TEXT DEFAULT '',
    ogTwitter TEXT DEFAULT '',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Recreate indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_updated ON products(updatedAt DESC);
CREATE INDEX idx_products_title ON products(title);

CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_updated ON news(updatedAt DESC);
CREATE INDEX idx_news_title ON news(title);

CREATE INDEX idx_equipments_category ON equipments(category);
CREATE INDEX idx_equipments_updated ON equipments(updatedAt DESC);
CREATE INDEX idx_equipments_title ON equipments(title);