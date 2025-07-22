-- Cloudflare D1 Database Schema

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    category_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cases', 'news', 'equipments')),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS news (
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
CREATE TABLE IF NOT EXISTS equipments (
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(category_name);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_updated ON products(updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);

CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_updated ON news(updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_news_title ON news(title);

CREATE INDEX IF NOT EXISTS idx_equipments_category ON equipments(category);
CREATE INDEX IF NOT EXISTS idx_equipments_updated ON equipments(updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_equipments_title ON equipments(title);