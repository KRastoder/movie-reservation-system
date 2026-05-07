"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  ArrowUpDown,
  X,
} from "lucide-react";

type ShowtimeCard = {
  id: number;
  movieId: number | null;
  movieTitle: string | null;
  moviePosterUrl: string | null;
  movieDuration: number | null;
  hallName: string | null;
  hallCity: string | null;
  airingDate: Date;
  airingTime: string | null;
  price: string;
};

type SortKey = "date" | "title" | "price";

export default function MoviesClient({
  showtimes,
  allTags,
  movieTagMap,
}: {
  showtimes: ShowtimeCard[];
  allTags: string[];
  movieTagMap: Record<string, string[]>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let result = [...showtimes];

    if (selectedTags.length > 0) {
      result = result.filter((st) => {
        const stTags = movieTagMap[st.movieId ?? ""] ?? [];
        return selectedTags.some((t) => stTags.includes(t));
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp =
            new Date(a.airingDate).getTime() -
            new Date(b.airingDate).getTime();
          break;
        case "title":
          cmp = (a.movieTitle ?? "").localeCompare(b.movieTitle ?? "");
          break;
        case "price":
          cmp = parseFloat(a.price) - parseFloat(b.price);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [showtimes, selectedTags, movieTagMap, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "date", label: "Date" },
    { key: "title", label: "Movie" },
    { key: "price", label: "Price" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-black/60">Sort by:</span>
          <div className="flex gap-2">
            {sortOptions.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleSort(opt.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
                    ${
                      active
                        ? "bg-black text-white"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {opt.label}
                  {active && <ArrowUpDown className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-black/40 ml-auto">
            {filtered.length} screening{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-black/60">Filter by tag:</span>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer
                    ${
                      active
                        ? "bg-black text-white"
                        : "bg-white text-black/60 border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {tag}
                  {active && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
          <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            No upcoming screenings
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedTags.length > 0
              ? "Try removing some filters."
              : "Check back later for new showtimes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filtered.map((st) => (
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
                    {st.movieId !== null && movieTagMap[st.movieId]?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {movieTagMap[st.movieId].slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-black/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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
                        {new Date(st.airingDate).toLocaleDateString("en-US", {
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
    </div>
  );
}
