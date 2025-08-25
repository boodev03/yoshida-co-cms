import { NextRequest, NextResponse } from "next/server";
import { createDatabaseConnection } from "@/configs/database.config";

export async function POST(request: NextRequest) {
  try {
    const db = await createDatabaseConnection();

    console.log("Setting up display_order column...");

    // Step 1: Add display_order column
    console.log("Adding display_order column...");
    await db.execute(
      "ALTER TABLE posts ADD COLUMN display_order INTEGER DEFAULT 0"
    );

    // Step 2: Update existing posts to have order based on creation date (newest first)
    console.log("Updating existing posts with display order...");
    await db.execute(`
      UPDATE posts 
      SET display_order = (
          SELECT COUNT(*) - ROW_NUMBER() OVER (ORDER BY createdAt DESC) + 1
          FROM posts p2
          WHERE p2.type = posts.type
      )
    `);

    // Step 3: Create indexes for better performance
    console.log("Creating indexes...");
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_posts_display_order ON posts(display_order)"
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_posts_type_order ON posts(type, display_order)"
    );

    // Step 4: Verify the changes
    console.log("Verifying changes...");
    const result = await db.execute(`
      SELECT id, type, display_order, createdAt, date 
      FROM posts 
      ORDER BY type, display_order
    `);

    console.log("Setup completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Display order column setup completed successfully",
      sampleData: result.results.slice(0, 5),
    });
  } catch (error) {
    console.error("Error setting up order column:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      },
      { status: 500 }
    );
  }
}
