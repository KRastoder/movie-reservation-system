"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { createHall } from "../hall-server-actions";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type SeatCell =
  | { type: "seat"; row: number; col: number; seatNumber: number }
  | { type: "gap-row"; row: number }
  | { type: "gap-col"; row: number; col: number }
  | { type: "both-gap"; row: number; col: number };

function computeSeatGrid(
  rows: number,
  cols: number,
  rowGap: number[],
  colGap: number[],
): { grid: SeatCell[][]; totalSeats: number } {
  const rowData: SeatCell[][] = [];
  let seatNumber = 1;

  for (let r = 1; r <= rows; r++) {
    const isGapRow = rowGap.includes(r);
    const cells: SeatCell[] = [];
    for (let c = 1; c <= cols; c++) {
      const isGapCol = colGap.includes(c);
      if (isGapRow && isGapCol) {
        cells.push({ type: "both-gap", row: r, col: c });
      } else if (isGapRow) {
        cells.push({ type: "gap-row", row: r });
      } else if (isGapCol) {
        cells.push({ type: "gap-col", row: r, col: c });
      } else {
        cells.push({ type: "seat", row: r, col: c, seatNumber });
        seatNumber++;
      }
    }
    rowData.push(cells);
  }

  return { grid: rowData, totalSeats: seatNumber - 1 };
}

function SeatPreview({
  rows,
  cols,
  rowGap,
  colGap,
}: {
  rows: number;
  cols: number;
  rowGap: number[];
  colGap: number[];
}) {
  const { grid, totalSeats } = useMemo(
    () => computeSeatGrid(rows, cols, rowGap, colGap),
    [rows, cols, rowGap, colGap],
  );

  if (rows < 1 || cols < 1) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Set rows and columns to see the preview
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-b from-gray-700 to-gray-600 rounded-lg py-2 text-center text-sm font-medium tracking-widest text-gray-200">
        SCREEN
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1.5 min-w-fit">
          {grid.map((cells, rowIndex) => {
            const r = rowIndex + 1;
            const rowIsGap = rowGap.includes(r);
            const hasOnlyGapCells =
              rowIsGap && cells.every((c) => c.type !== "seat");

            if (hasOnlyGapCells) {
              return (
                <div key={r} className="flex items-center gap-2">
                  <span className="w-7 flex-shrink-0 text-[10px] text-gray-400 text-right font-mono">
                    {r}
                  </span>
                  <div className="flex-1 h-5 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">
                      Walkway &mdash; Row {r}
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
                    if (cell.type === "seat") {
                      return (
                        <div
                          key={colIndex}
                          className="w-8 h-7 bg-emerald-50 border border-emerald-300 rounded text-[10px] font-medium text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors cursor-default select-none"
                          title={`Row ${cell.row}, Seat ${cell.seatNumber}`}
                        >
                          {cell.seatNumber}
                        </div>
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

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {rows} &times; {cols} grid
          {rowGap.length > 0 && `, ${rowGap.length} gap row${rowGap.length > 1 ? "s" : ""}`}
          {colGap.length > 0 && `, ${colGap.length} gap column${colGap.length > 1 ? "s" : ""}`}
        </span>
        <span className="font-semibold text-emerald-700">
          {totalSeats} seat{totalSeats !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export default function HallForm() {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [seatRows, setSeatRows] = useState(5);
  const [seatCols, setSeatCols] = useState(8);
  const [rowGapRaw, setRowGapRaw] = useState("");
  const [colGapRaw, setColGapRaw] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    hallId: number;
    totalSeats: number;
  } | null>(null);

  const rowGap = useMemo(() => {
    if (!rowGapRaw.trim()) return [];
    return [
      ...new Set(
        rowGapRaw
          .split(",")
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n) && n >= 1 && n <= seatRows),
      ),
    ].sort((a, b) => a - b);
  }, [rowGapRaw, seatRows]);

  const colGap = useMemo(() => {
    if (!colGapRaw.trim()) return [];
    return [
      ...new Set(
        colGapRaw
          .split(",")
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n) && n >= 1 && n <= seatCols),
      ),
    ].sort((a, b) => a - b);
  }, [colGapRaw, seatCols]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (seatRows - rowGap.length < 1) {
      setError("At least one non-gap row is required");
      return;
    }
    if (seatCols - colGap.length < 1) {
      setError("At least one non-gap column is required");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("city", city.trim());
    formData.set("address", address.trim());
    formData.set("seatRows", String(seatRows));
    formData.set("seatCols", String(seatCols));
    formData.set("rowGap", rowGapRaw);
    formData.set("colGap", colGapRaw);

    startTransition(async () => {
      try {
        const result = await createHall(formData);
        setSuccess(result);
        setName("");
        setCity("");
        setAddress("");
        setSeatRows(5);
        setSeatCols(8);
        setRowGapRaw("");
        setColGapRaw("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create hall");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Hall created with {success.totalSeats} seat
            {success.totalSeats !== 1 ? "s" : ""} (ID: {success.hallId}).
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Hall Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hall Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cinema 1, Hall A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ljubljana"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Main Street 10"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Seat Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatRows">Rows</Label>
              <Input
                id="seatRows"
                type="number"
                min={1}
                max={50}
                value={seatRows}
                onChange={(e) =>
                  setSeatRows(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seatCols">Columns</Label>
              <Input
                id="seatCols"
                type="number"
                min={1}
                max={50}
                value={seatCols}
                onChange={(e) =>
                  setSeatCols(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rowGap">Row Gaps (walkways)</Label>
              <Input
                id="rowGap"
                value={rowGapRaw}
                onChange={(e) => setRowGapRaw(e.target.value)}
                placeholder="e.g. 3, 6"
              />
              <p className="text-[11px] text-gray-400">
                Enter row numbers separated by commas
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="colGap">Column Gaps (aisles)</Label>
              <Input
                id="colGap"
                value={colGapRaw}
                onChange={(e) => setColGapRaw(e.target.value)}
                placeholder="e.g. 4"
              />
              <p className="text-[11px] text-gray-400">
                Enter column numbers separated by commas
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seat Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <SeatPreview
            rows={seatRows}
            cols={seatCols}
            rowGap={rowGap}
            colGap={colGap}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto min-w-40 bg-black text-white hover:bg-gray-800"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Hall...
          </span>
        ) : (
          "Create Hall"
        )}
      </Button>
    </form>
  );
}
