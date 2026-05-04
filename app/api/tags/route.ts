import { db } from "@/db";
import { tags } from "@/db/movie-schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allTags = await db.select().from(tags);
    return NextResponse.json(allTags);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
