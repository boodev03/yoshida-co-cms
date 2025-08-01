-- Multilingual Database Schema for Yoshida Co CMS
-- This schema supports English and Japanese content with optimized structure

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Insert default languages
INSERT OR IGNORE INTO languages (code, name, is_default) VALUES 
    ('en', 'English', FALSE),
    ('ja', 'Japanese', TRUE);

-- Posts table - stores common fields and metadata
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('cases', 'news', 'equipments')),
    thumbnail TEXT DEFAULT '',
    ogImage TEXT DEFAULT '',
    ogTwitter TEXT DEFAULT '',
    date TEXT DEFAULT '',
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Post translations table - stores language-specific content
CREATE TABLE IF NOT EXISTS post_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    cardDescription TEXT DEFAULT '',
    sections TEXT DEFAULT '[]', -- JSON string for ContentSection[]
    metaTitle TEXT DEFAULT '',
    metaKeywords TEXT DEFAULT '',
    metaDescription TEXT DEFAULT '',
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code),
    UNIQUE(post_id, language_code)
);

-- Categories table (updated for multilingual support)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('cases', 'news', 'equipments')),
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Category translations table
CREATE TABLE IF NOT EXISTS category_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    category_name TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code),
    UNIQUE(category_id, language_code)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(createdAt);
CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_code);