import { db } from "@/db";
import { hallMovies } from "@/db/hall-schema";
import { movies, movieTags, tags } from "@/db/movie-schema";
import { halls } from "@/db/hall-schema";
import { eq, gte, asc } from "drizzle-orm";
import MoviesClient from "./movies-client";

export const metadata = {
  title: "All Movies - Book Movies",
};

type ShowtimeCard = {
  id: number;
  movieId: number | null;
  movieTitle: string | null;
  moviePosterUrl: string | null;
  movieDuration: number | null;
  hallName: string | null;
  hallCity: string | null;
  airingDate: Date;
  airingTime: string | null;
  price: string;
};

async function getAllShowtimes(): Promise<ShowtimeCard[]> {
  const data = await db
    .select({
      id: hallMovies.id,
      movieId: hallMovies.movieId,
      movieTitle: movies.title,
      moviePosterUrl: movies.posterUrl,
      movieDuration: movies.duration,
      hallName: halls.name,
      hallCity: halls.city,
      airingDate: hallMovies.airingDate,
      airingTime: hallMovies.airingTime,
      price: hallMovies.price,
    })
    .from(hallMovies)
    .leftJoin(movies, eq(hallMovies.movieId, movies.id))
    .leftJoin(halls, eq(hallMovies.hallId, halls.id))
    .where(gte(hallMovies.airingDate, new Date()))
    .orderBy(asc(hallMovies.airingDate));

  return data;
}

async function getAllTags(): Promise<string[]> {
  const rows = await db.select({ name: tags.tag }).from(tags);
  return rows.map((r) => r.name);
}

async function getMovieTagMap(): Promise<Map<number, string[]>> {
  const rows = await db
    .select({ movieId: movieTags.movieId, tagName: tags.tag })
    .from(movieTags)
    .leftJoin(tags, eq(movieTags.tagId, tags.id));

  const map = new Map<number, string[]>();
  for (const r of rows) {
    if (r.movieId && r.tagName) {
      const existing = map.get(r.movieId) ?? [];
      existing.push(r.tagName);
      map.set(r.movieId, existing);
    }
  }
  return map;
}

export default async function MoviesPage() {
  const [showtimes, allTags, movieTagMap] = await Promise.all([
    getAllShowtimes(),
    getAllTags(),
    getMovieTagMap(),
  ]);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          All Movies
        </h1>
        <p className="text-black/60 mb-8">
          Browse all upcoming screenings
        </p>

        <MoviesClient
          showtimes={showtimes}
          allTags={allTags}
          movieTagMap={Object.fromEntries(movieTagMap)}
        />
      </div>
    </main>
  );
}
