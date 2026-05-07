import { db } from "@/db";
import { hallMovies, halls } from "@/db/hall-schema";
import { movies } from "@/db/movie-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const movieId = parseInt(params.slug);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 },
      );
    }
    
    const showtimes = await db
      .select({
        id: hallMovies.id,
        airingDate: hallMovies.airingDate,
        airingTime: hallMovies.airingTime,
        price: hallMovies.price,
        hallId: hallMovies.hallId,
        hallName: halls.name,
        hallCity: halls.city,
      })
      .from(hallMovies)
      .leftJoin(halls, eq(hallMovies.hallId, halls.id))
      .where(eq(hallMovies.movieId, movieId));
    
    return NextResponse.json(showtimes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch showtimes" },
      { status: 500 },
    );
  }
}
