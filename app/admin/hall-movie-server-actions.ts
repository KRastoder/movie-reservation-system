"use server";

import { db } from "@/db";
import { hallMovies } from "@/db/hall-schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createHallMovieSchema = z.object({
  movieId: z.coerce.number().int().min(1, "Movie is required"),
  hallId: z.coerce.number().int().min(1, "Hall is required"),
  airingDate: z.string().min(1, "Date is required"),
  airingTime: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
});

export async function createHallMovie(formData: FormData) {
  try {
    const raw = {
      movieId: formData.get("movieId") as string,
      hallId: formData.get("hallId") as string,
      airingDate: formData.get("airingDate") as string,
      airingTime: formData.get("airingTime") as string,
      price: formData.get("price") as string,
    };

    const validated = createHallMovieSchema.parse(raw);
    const timeStr = validated.airingTime;
    const airingDate = timeStr
      ? new Date(`${validated.airingDate}T${timeStr}:00`)
      : new Date(`${validated.airingDate}T00:00:00`);

    const result = await db.transaction(async (tx) => {
      const [hallMovie] = await tx
        .insert(hallMovies)
        .values({
          movieId: validated.movieId,
          hallId: validated.hallId,
          airingDate,
          airingTime: validated.airingTime || null,
          price: validated.price,
        })
        .returning();
      return hallMovie;
    });

    revalidatePath("/admin");
    return result;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.issues.map((e) => e.message).join(", "));
    }
    if (err instanceof Error) throw err;
    throw new Error("Failed to create showtime");
  }
}

export async function deleteHallMovie(id: number) {
  try {
    if (!id || id < 1) throw new Error("Invalid showtime ID");

    await db.transaction(async (tx) => {
      await tx.delete(hallMovies).where(eq(hallMovies.id, id));
    });

    revalidatePath("/admin");
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to delete showtime");
  }
}
