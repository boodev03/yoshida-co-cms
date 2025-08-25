-- Setup script to add display_order column to posts table
-- Run this script through your database API to update your existing database

-- Step 1: Add display_order column to posts table
ALTER TABLE posts ADD COLUMN display_order INTEGER DEFAULT 0;

-- Step 2: Update existing posts to have order based on creation date (newest first)
-- This assigns order 1 to the newest post, 2 to the second newest, etc.
UPDATE posts
SET
    display_order = (
        SELECT COUNT(*) - ROW_NUMBER() OVER (
                ORDER BY createdAt DESC
            ) + 1
        FROM posts p2
        WHERE
            p2.type = posts.type
    );

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_display_order ON posts (display_order);

CREATE INDEX IF NOT EXISTS idx_posts_type_order ON posts(type, display_order);

-- Step 4: Verify the changes
SELECT
    id,
    type,
    display_order,
    createdAt,
    date
FROM posts
ORDER BY type, display_order;