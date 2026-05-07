import { db } from "@/db";
import { hallMovies } from "@/db/hall-schema";
import { movies } from "@/db/movie-schema";
import { halls } from "@/db/hall-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db
      .select({
        id: hallMovies.id,
        movieId: hallMovies.movieId,
        movieTitle: movies.title,
        hallId: hallMovies.hallId,
        hallName: halls.name,
        airingDate: hallMovies.airingDate,
        airingTime: hallMovies.airingTime,
        price: hallMovies.price,
      })
      .from(hallMovies)
      .leftJoin(movies, eq(hallMovies.movieId, movies.id))
      .leftJoin(halls, eq(hallMovies.hallId, halls.id));

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch showtimes" },
      { status: 500 },
    );
  }
}
