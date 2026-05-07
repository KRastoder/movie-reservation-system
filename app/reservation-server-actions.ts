"use server";

import { db } from "@/db";
import { reservations } from "@/db/hall-schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createReservation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("You must be signed in to reserve a seat");
  }

  const seatId = parseInt(formData.get("seatId") as string);
  const hallMovieId = parseInt(formData.get("hallMovieId") as string);

  if (isNaN(seatId) || isNaN(hallMovieId)) {
    throw new Error("Invalid parameters");
  }

  const existing = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.seatId, seatId),
        eq(reservations.hallMovieId, hallMovieId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("This seat is already reserved");
  }

  await db.insert(reservations).values({
    userId: session.user.id,
    seatId,
    hallMovieId,
  });

  revalidatePath(`/show/${hallMovieId}`);
}
