"use server";

import { db } from "@/db";
import { halls, hallLayout, hallSeats } from "@/db/hall-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createHallSchema = z.object({
  name: z.string().min(1, "Hall name is required").max(255),
  city: z.string().min(1, "City is required").max(255),
  address: z.string().min(1, "Address is required").max(255),
  seatRows: z.coerce.number().int().min(1, "At least 1 row required").max(50, "Maximum 50 rows"),
  seatCols: z.coerce.number().int().min(1, "At least 1 column required").max(50, "Maximum 50 columns"),
  rowGap: z.string().optional().default(""),
  colGap: z.string().optional().default(""),
});

function parseGaps(input: string, max: number): number[] {
  if (!input.trim()) return [];
  return [...new Set(
    input
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= max),
  )].sort((a, b) => a - b);
}

export async function createHall(formData: FormData) {
  try {
    const raw = {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      seatRows: formData.get("seatRows") as string,
      seatCols: formData.get("seatCols") as string,
      rowGap: formData.get("rowGap") as string,
      colGap: formData.get("colGap") as string,
    };

    const validated = createHallSchema.parse(raw);
    const rows = validated.seatRows;
    const cols = validated.seatCols;
    const rGap = parseGaps(validated.rowGap, rows);
    const cGap = parseGaps(validated.colGap, cols);

    if (rows - rGap.length < 1) {
      throw new Error("At least one non-gap row is required");
    }
    if (cols - cGap.length < 1) {
      throw new Error("At least one non-gap column is required");
    }

    const result = await db.transaction(async (tx) => {
      const [hall] = await tx
        .insert(halls)
        .values({
          name: validated.name,
          city: validated.city,
          address: validated.address,
        })
        .returning();

      await tx.insert(hallLayout).values({
        hallId: hall.id,
        seatRows: rows,
        seatCols: cols,
        rowGap: rGap,
        colGap: cGap,
      });

      const seatData: { hallId: number; seatNumber: number }[] = [];
      let seatNumber = 1;

      for (let r = 1; r <= rows; r++) {
        if (rGap.includes(r)) continue;
        for (let c = 1; c <= cols; c++) {
          if (cGap.includes(c)) continue;
          seatData.push({ hallId: hall.id, seatNumber });
          seatNumber++;
        }
      }

      if (seatData.length > 0) {
        await tx.insert(hallSeats).values(seatData);
      }

      return { hallId: hall.id, totalSeats: seatData.length };
    });

    revalidatePath("/admin");
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map((e) => e.message).join(", "));
    }
    if (error instanceof Error) throw error;
    throw new Error("Failed to create hall");
  }
}
