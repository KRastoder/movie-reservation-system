import { db } from "@/db";
import { hallMovies, hallLayout, hallSeats, reservations } from "@/db/hall-schema";
import { movies, movieTags, tags } from "@/db/movie-schema";
import { halls } from "@/db/hall-schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Film, ArrowLeft } from "lucide-react";
import SeatPicker from "./seat-picker";

type ShowtimeDetail = {
  id: number;
  movieId: number | null;
  movieTitle: string | null;
  moviePosterUrl: string | null;
  movieDuration: number | null;
  movieDescription: string | null;
  hallName: string | null;
  hallCity: string | null;
  hallAddress: string | null;
  airingDate: Date;
  airingTime: string | null;
  price: string;
};

async function getShowtime(id: number): Promise<ShowtimeDetail | null> {
  const [result] = await db
    .select({
      id: hallMovies.id,
      movieId: hallMovies.movieId,
      movieTitle: movies.title,
      moviePosterUrl: movies.posterUrl,
      movieDuration: movies.duration,
      movieDescription: movies.description,
      hallName: halls.name,
      hallCity: halls.city,
      hallAddress: halls.address,
      airingDate: hallMovies.airingDate,
      airingTime: hallMovies.airingTime,
      price: hallMovies.price,
    })
    .from(hallMovies)
    .leftJoin(movies, eq(hallMovies.movieId, movies.id))
    .leftJoin(halls, eq(hallMovies.hallId, halls.id))
    .where(eq(hallMovies.id, id));

  return result ?? null;
}

async function getMovieTags(movieId: number | null): Promise<string[]> {
  if (!movieId) return [];
  const rows = await db
    .select({ tagName: tags.tag })
    .from(movieTags)
    .leftJoin(tags, eq(movieTags.tagId, tags.id))
    .where(eq(movieTags.movieId, movieId));
  return rows.map((r) => r.tagName).filter(Boolean) as string[];
}

async function getSeatData(showtimeId: number) {
  const [showtime] = await db
    .select({ hallId: hallMovies.hallId })
    .from(hallMovies)
    .where(eq(hallMovies.id, showtimeId));

  if (!showtime?.hallId) return null;

  const [layout] = await db
    .select()
    .from(hallLayout)
    .where(eq(hallLayout.hallId, showtime.hallId));

  const allSeats = await db
    .select()
    .from(hallSeats)
    .where(eq(hallSeats.hallId, showtime.hallId));

  const taken = await db
    .select({ seatId: reservations.seatId })
    .from(reservations)
    .where(eq(reservations.hallMovieId, showtimeId));

  const reservedSeatIds = new Set(taken.map((r) => r.seatId));

  const seats = allSeats.map((seat) => ({
    id: seat.id,
    seatNumber: seat.seatNumber,
    reserved: reservedSeatIds.has(seat.id),
  }));

  return { layout: layout ?? null, seats };
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const showtimeId = parseInt(id);

  if (isNaN(showtimeId)) {
    notFound();
  }

  const showtime = await getShowtime(showtimeId);

  if (!showtime) {
    notFound();
  }

  const seatData = await getSeatData(showtimeId);
  const tags = await getMovieTags(showtime.movieId);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden sticky top-24">
              {showtime.moviePosterUrl ? (
                <img
                  src={showtime.moviePosterUrl}
                  alt={showtime.movieTitle ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Film className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {showtime.movieTitle ?? "Unknown Movie"}
              </h1>
              {showtime.movieDuration && (
                <p className="text-black/60 mt-2">{showtime.movieDuration} min</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-black/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Showtime Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-black/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-black/60">Date</p>
                      <p className="font-medium">
                        {showtime.airingDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {showtime.airingTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-black/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-black/60">Time</p>
                        <p className="font-medium">{showtime.airingTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-black/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-black/60">Location</p>
                      <p className="font-medium">{showtime.hallName ?? "Unknown Hall"}</p>
                      {showtime.hallCity && (
                        <p className="text-sm text-black/60">{showtime.hallCity}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-black/40 mt-0.5 flex-shrink-0 flex items-center justify-center font-semibold text-sm">
                      &euro;
                    </div>
                    <div>
                      <p className="text-sm text-black/60">Price</p>
                      <p className="font-medium">&euro;{showtime.price}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showtime.movieDescription && (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    About the Movie
                  </h2>
                  <p className="text-black/70 leading-relaxed">
                    {showtime.movieDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            <SeatPicker
              hallMovieId={showtimeId}
              layout={seatData?.layout ?? null}
              seats={seatData?.seats ?? []}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
