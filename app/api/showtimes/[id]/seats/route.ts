import { db } from "@/db";
import { hallMovies, hallLayout, hallSeats, reservations } from "@/db/hall-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const showtimeId = parseInt(id);

    if (isNaN(showtimeId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [showtime] = await db
      .select()
      .from(hallMovies)
      .where(eq(hallMovies.id, showtimeId));

    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    if (!showtime.hallId) {
      return NextResponse.json({ error: "Showtime has no hall" }, { status: 400 });
    }

    const [layout] = await db
      .select()
      .from(hallLayout)
      .where(eq(hallLayout.hallId, showtime.hallId));

    const allSeats = await db
      .select()
      .from(hallSeats)
      .where(eq(hallSeats.hallId, showtime.hallId));

    const takenReservations = await db
      .select({ seatId: reservations.seatId })
      .from(reservations)
      .where(eq(reservations.hallMovieId, showtimeId));

    const reservedSeatIds = new Set(takenReservations.map((r) => r.seatId));

    const seats = allSeats.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      reserved: reservedSeatIds.has(seat.id),
    }));

    return NextResponse.json({ layout: layout || null, seats, hallId: showtime.hallId });
  } catch {
    return NextResponse.json({ error: "Failed to fetch seats" }, { status: 500 });
  }
}
