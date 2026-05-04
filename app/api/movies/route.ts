import { db } from "@/db";
import { movies } from "@/db/movie-schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMovies = await db.select().from(movies);
    return NextResponse.json(allMovies);
  } catch {
    //BEST ERROR HANDLING EVER!
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}
