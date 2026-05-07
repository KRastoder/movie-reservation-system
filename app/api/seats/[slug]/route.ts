import { db } from "@/db";
import { hallSeats } from "@/db/hall-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const hallMovieId = parseInt(params.slug);

    if (isNaN(hallMovieId)) {
      return NextResponse.json(
        { error: "Invalid hall movie ID" },
        { status: 400 },
      );
    }

    const seats = await db
      .select()
      .from(hallSeats)
      .where(eq(hallSeats.hallId, hallMovieId));

    return NextResponse.json(seats);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch seats" },
      { status: 500 },
    );
  }
}
