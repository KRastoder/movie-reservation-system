import { db } from "@/db";
import { halls } from "@/db/hall-schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allHalls = await db.select().from(halls);
    return NextResponse.json(allHalls);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 },
    );
  }
}
