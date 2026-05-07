"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/lib/auth-client";
import { createReservation } from "@/app/reservation-server-actions";
import { AlertCircle, CheckCircle, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

type SeatData = {
  id: number;
  seatNumber: number | null;
  reserved: boolean;
};

type LayoutData = {
  seatRows: number;
  seatCols: number;
  rowGap: number[];
  colGap: number[];
};

export default function SeatPicker({
  hallMovieId,
  layout,
  seats,
}: {
  hallMovieId: number;
  layout: LayoutData | null;
  seats: SeatData[];
}) {
  const router = useRouter();
  const { data: session, isPending: authLoading } = useSession();
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (authLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-black/40" />
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-8 text-center space-y-4">
          <LogIn className="h-10 w-10 mx-auto text-black/30" />
          <div>
            <h2 className="text-lg font-semibold">Sign in Required</h2>
            <p className="text-sm text-black/60 mt-1">
              You need to be signed in to reserve a seat.
            </p>
          </div>
          <Link href="/sign-in">
            <Button className="bg-black text-white hover:bg-gray-800 cursor-pointer">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!layout) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-black/60">
            No seat layout configured for this hall.
          </p>
        </CardContent>
      </Card>
    );
  }

  const seatMap = new Map(
    seats.filter((s) => s.seatNumber !== null).map((s) => [s.seatNumber!, s]),
  );

  const grid: { type: "seat" | "gap-row" | "gap-col" | "both-gap"; seat?: SeatData; row: number; col: number }[][] = [];

  let seatNumber = 1;
  for (let r = 1; r <= layout.seatRows; r++) {
    const isGapRow = layout.rowGap.includes(r);
    const row: { type: "seat" | "gap-row" | "gap-col" | "both-gap"; seat?: SeatData; row: number; col: number }[] = [];

    for (let c = 1; c <= layout.seatCols; c++) {
      const isGapCol = layout.colGap.includes(c);

      if (isGapRow && isGapCol) {
        row.push({ type: "both-gap", row: r, col: c });
      } else if (isGapRow) {
        row.push({ type: "gap-row", row: r, col: c });
      } else if (isGapCol) {
        row.push({ type: "gap-col", row: r, col: c });
      } else {
        const seat = seatMap.get(seatNumber);
        row.push({ type: "seat", row: r, col: c, seat });
        seatNumber++;
      }
    }
    grid.push(row);
  }

  async function handleConfirmReservation() {
    if (!selectedSeat) return;
    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("seatId", String(selectedSeat.id));
    formData.set("hallMovieId", String(hallMovieId));

    try {
      await createReservation(formData);
      setSuccess(`Seat ${selectedSeat.seatNumber} reserved successfully!`);
      setSelectedSeat(null);
      setTimeout(() => router.refresh(), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reserve seat");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Select Your Seat</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-gradient-to-b from-gray-700 to-gray-600 rounded-lg py-2.5 text-center text-sm font-medium tracking-[0.2em] text-gray-200">
            SCREEN
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-1.5 min-w-fit">
              {grid.map((cells, rowIndex) => {
                const r = rowIndex + 1;
                const isGapRow = layout.rowGap.includes(r);

                if (isGapRow) {
                  return (
                    <div key={r} className="flex items-center gap-2">
                      <span className="w-7 flex-shrink-0 text-[10px] text-gray-400 text-right font-mono">
                        {r}
                      </span>
                      <div className="flex-1 h-5 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
                        <span className="text-[10px] text-gray-400">
                          Walkway
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={r} className="flex items-center gap-2">
                    <span className="w-7 flex-shrink-0 text-[10px] text-gray-400 text-right font-mono">
                      {r}
                    </span>
                    <div className="flex gap-1">
                      {cells.map((cell, colIndex) => {
                        if (cell.type === "gap-col" || cell.type === "both-gap") {
                          return (
                            <div
                              key={colIndex}
                              className="w-2 bg-gray-100 rounded"
                            />
                          );
                        }
                        if (cell.type === "seat" && cell.seat) {
                          const isReserved = cell.seat.reserved;
                          return (
                            <button
                              key={colIndex}
                              type="button"
                              disabled={isReserved}
                              onClick={() =>
                                !isReserved && setSelectedSeat(cell.seat!)
                              }
                              className={`
                                w-8 h-7 rounded text-[10px] font-medium flex items-center justify-center transition-all
                                ${
                                  isReserved
                                    ? "bg-red-100 border border-red-300 text-red-400 cursor-not-allowed"
                                    : "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:scale-110 cursor-pointer"
                                }
                              `}
                              title={`Seat ${cell.seat.seatNumber}${isReserved ? " (Reserved)" : ""}`}
                            >
                              {cell.seat.seatNumber}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-black/60">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3.5 bg-emerald-50 border border-emerald-300 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3.5 bg-red-100 border border-red-300 rounded" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3.5 bg-gray-50 border border-dashed border-gray-200 rounded" />
              <span>Walkway</span>
            </div>
          </div>
        </div>

        <Dialog
          open={!!selectedSeat}
          onOpenChange={(open) => !open && setSelectedSeat(null)}
        >
          <DialogContent className="bg-white sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-black">
                Reserve Seat {selectedSeat?.seatNumber}
              </DialogTitle>
              <DialogDescription className="text-black/60">
                Are you sure you want to reserve this seat? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSeat(null)}
                className="border-black text-black hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReservation}
                disabled={isPending}
                className="bg-black text-white hover:bg-gray-800 cursor-pointer"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reserving...
                  </span>
                ) : (
                  "Confirm Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
