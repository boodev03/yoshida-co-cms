-- Add order column to posts table for controlling post rendering order
-- This script will add the order column and set initial values based on creation date

-- Add order column to posts table
ALTER TABLE posts ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing posts to have order based on creation date (newest first)
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

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_posts_display_order ON posts (display_order);

CREATE INDEX IF NOT EXISTS idx_posts_type_order ON posts(type, display_order);

-- Verify the changes
SELECT
    id,
    type,
    display_order,
    createdAt,
    date
FROM posts
ORDER BY type, display_order;