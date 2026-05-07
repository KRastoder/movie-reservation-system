import { db } from "@/db";
import { movieTags, movies, tags } from "@/db/movie-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMovieTags = await db
      .select({
        id: movieTags.id,
        movieId: movieTags.movieId,
        tagId: movieTags.tagId,
        movieTitle: movies.title,
        tagName: tags.tag,
      })
      .from(movieTags)
      .leftJoin(movies, eq(movieTags.movieId, movies.id))
      .leftJoin(tags, eq(movieTags.tagId, tags.id));
    
    return NextResponse.json(allMovieTags);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movie tags" },
      { status: 500 }
    );
  }
}
