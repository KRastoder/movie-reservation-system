import { db } from "@/db";
import { hallMovies } from "@/db/hall-schema";
import { movies } from "@/db/movie-schema";
import { halls } from "@/db/hall-schema";
import { eq, gte, asc } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Film, ArrowRight } from "lucide-react";

type ShowtimeCard = {
  id: number;
  movieTitle: string | null;
  moviePosterUrl: string | null;
  movieDuration: number | null;
  hallName: string | null;
  hallCity: string | null;
  airingDate: Date;
  airingTime: string | null;
  price: string;
};

async function getUpcomingShowtimes(): Promise<ShowtimeCard[]> {
  const data = await db
    .select({
      id: hallMovies.id,
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
    .orderBy(asc(hallMovies.airingDate))
    .limit(5);

  return data;
}

export default async function Home() {
  const showtimes = await getUpcomingShowtimes();

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#f5f5f5_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#f5f5f5_0%,_transparent_60%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-black/60 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Now accepting reservations
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-black leading-[0.9] mb-6">
            Book Your
            <br />
            <span className="text-black/40">Perfect Seat</span>
          </h1>

          <p className="text-lg sm:text-xl text-black/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Discover the latest films, choose your favorite cinema, and reserve
            your seats in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#showtimes">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-base cursor-pointer">
                Browse Showtimes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/movies">
              <Button className="bg-white text-black border border-black hover:bg-gray-100 px-8 py-6 text-base cursor-pointer">
                All Movies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="showtimes" className="pb-24 sm:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Now Showing
              </h2>
              <p className="text-black/60 mt-2">Upcoming screenings</p>
            </div>
            <Link
              href="/movies"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {showtimes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
              <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">
                No upcoming showtimes
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Check back later for new screenings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {showtimes.map((st) => (
                <Link
                  key={st.id}
                  href={`/show/${st.id}`}
                  className="group block"
                >
                  <Card className="bg-white border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                    <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                      {st.moviePosterUrl ? (
                        <img
                          src={st.moviePosterUrl}
                          alt={st.movieTitle ?? ""}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Film className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-md">
                        &euro;{st.price}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div>
                        <h3 className="font-semibold text-black group-hover:text-black/70 transition-colors line-clamp-1">
                          {st.movieTitle ?? "Unknown Movie"}
                        </h3>
                        {st.movieDuration && (
                          <p className="text-xs text-black/40 mt-0.5">
                            {st.movieDuration} min
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-black/60 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-black/40" />
                          <span className="truncate">
                            {st.hallName ?? "Unknown Hall"}
                            {st.hallCity && `, ${st.hallCity}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-black/40" />
                          <span>
                            {st.airingDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {st.airingTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-black/40" />
                            <span>{st.airingTime}</span>
                          </div>
                        )}
                      </div>

                      <Button className="w-full bg-black text-white hover:bg-gray-800 cursor-pointer mt-auto">
                        Reserve
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/movies"
              className="inline-flex items-center gap-1 text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              View all movies
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Ready for a Movie Night?
            </h2>
            <p className="text-black/60 mb-8">
              Sign in to book your tickets, choose your preferred seats, and
              enjoy the show.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-base cursor-pointer">
                  Get Started
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-base cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
