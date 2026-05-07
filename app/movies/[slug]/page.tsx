"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";

type Showtime = {
  id: number;
  airingDate: string;
  airingTime: string | null;
  price: string;
  hallId: number;
  hallName: string;
  hallCity: string;
};

type Seat = {
  id: number;
  seatNumber: number;
  hallId: number;
};

export default function MovieDetails() {
  const params = useParams();
  const movieId = parseInt(params.slug as string);
  
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<number | null>(null);

  useEffect(() => {
    if (movieId) {
      loadData();
    }
  }, [movieId]);

  async function loadData() {
    try {
      const [movieRes, showtimesRes, seatsRes] = await Promise.all([
        fetch(`/api/movies`),
        fetch(`/api/movies/${movieId}/showtimes`),
        selectedShowtime 
          ? fetch(`/api/seats/${selectedShowtime}`)
          : Promise.resolve({ ok: true, json: () => [] }),
      ]);

      if (!movieRes.ok || !showtimesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const moviesData = await movieRes.json();
      const movieData = moviesData.find((m: any) => m.id === movieId);
      
      if (!movieData) {
        throw new Error("Movie not found");
      }

      setMovie(movieData);
      
      const showtimesData = await showtimesRes.json();
      setShowtimes(showtimesData);

      if (selectedShowtime && seatsRes.ok) {
        const seatsData = await seatsRes.json();
        setSeats(seatsData);
      }

      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setLoading(false);
    }
  }

  async function handleShowtimeSelect(showtimeId: number) {
    setSelectedShowtime(showtimeId);
    
    try {
      const seatsRes = await fetch(`/api/seats/${showtimeId}`);
      if (seatsRes.ok) {
        const seatsData = await seatsRes.json();
        setSeats(seatsData);
      }
    } catch {
      setError("Failed to load seats");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black p-8 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-white text-black p-8">
        <Alert className="border-red-500 bg-red-50">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-black">
            Movie not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-black">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-8 mb-8">
          <div className="w-1/3">
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="w-2/3">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <p className="text-gray-700 mb-4">{movie.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span>{movie.duration} minutes</span>
            </div>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Showtimes</h2>
          
          {showtimes.length === 0 ? (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription className="text-black">
                No showtimes available for this movie.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showtimes.map((showtime) => (
                <Card 
                  key={showtime.id}
                  className={`p-4 cursor-pointer border-2 transition-colors ${
                    selectedShowtime === showtime.id 
                      ? "border-black bg-gray-100" 
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => handleShowtimeSelect(showtime.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(showtime.airingDate).toLocaleDateString()}
                    </span>
                  </div>
                  {showtime.airingTime && (
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{showtime.airingTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{showtime.hallName}, {showtime.hallCity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">${showtime.price}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Seats Section */}
        {selectedShowtime && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Available Seats</h2>
            
            {seats.length === 0 ? (
              <Alert className="bg-gray-50 border-gray-200">
                <AlertDescription className="text-black">
                  No seats found for this showtime.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-10 gap-2">
                {seats.map((seat) => (
                  <div
                    key={seat.id}
                    className="w-10 h-10 border border-black rounded flex items-center justify-center cursor-pointer hover:bg-gray-100"
                  >
                    {seat.seatNumber}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
