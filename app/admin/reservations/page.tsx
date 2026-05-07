import { db } from "@/db";
import { reservations } from "@/db/hall-schema";
import { hallSeats } from "@/db/hall-schema";
import { hallMovies } from "@/db/hall-schema";
import { halls } from "@/db/hall-schema";
import { movies } from "@/db/movie-schema";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Film, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Reservations - Admin",
};

export default async function ReservationsPage() {
  const data = await db
    .select({
      id: reservations.id,
      userName: user.name,
      userEmail: user.email,
      seatNumber: hallSeats.seatNumber,
      movieTitle: movies.title,
      hallName: halls.name,
      hallCity: halls.city,
      airingDate: hallMovies.airingDate,
      airingTime: hallMovies.airingTime,
      price: hallMovies.price,
      available: reservations.available,
    })
    .from(reservations)
    .leftJoin(user, eq(reservations.userId, user.id))
    .leftJoin(hallSeats, eq(reservations.seatId, hallSeats.id))
    .leftJoin(hallMovies, eq(reservations.hallMovieId, hallMovies.id))
    .leftJoin(movies, eq(hallMovies.movieId, movies.id))
    .leftJoin(halls, eq(hallMovies.hallId, halls.id))
    .orderBy(reservations.id);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          &larr; Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Reservations</h1>
        </div>

        {data.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No reservations yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Reservations will appear here once users start booking seats.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">
                {data.length} reservation{data.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">User</TableHead>
                    <TableHead className="text-black">Movie</TableHead>
                    <TableHead className="text-black">Hall</TableHead>
                    <TableHead className="text-black">Seat</TableHead>
                    <TableHead className="text-black">Date</TableHead>
                    <TableHead className="text-black">Time</TableHead>
                    <TableHead className="text-black">Price</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r) => (
                    <TableRow key={r.id} className="border-gray-200">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-black text-sm">
                            {r.userName ?? "Unknown"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {r.userEmail ?? ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-black font-medium">
                        {r.movieTitle ?? "—"}
                      </TableCell>
                      <TableCell className="text-black">
                        {r.hallName ?? "—"}
                        {r.hallCity && (
                          <span className="text-gray-400 text-xs">
                            {" "}
                            &middot; {r.hallCity}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-black">
                        {r.seatNumber !== null ? (
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-gray-100 text-xs font-mono font-medium">
                            {r.seatNumber}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-black text-sm">
                        {r.airingDate
                          ? new Date(r.airingDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-black">
                        {r.airingTime || "—"}
                      </TableCell>
                      <TableCell className="text-black">
                        &euro;{r.price}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.available
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {r.available ? "Active" : "Cancelled"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
