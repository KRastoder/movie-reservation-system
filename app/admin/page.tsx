"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import {
  createMovie,
  updateMovie,
  deleteMovie,
  createTag,
  updateTag,
  deleteTag,
  createMovieTag,
  deleteMovieTag,
} from "./movie-server-actions";
import { createHallMovie, deleteHallMovie } from "./hall-movie-server-actions";
import { movies, tags } from "@/db/movie-schema";
import { halls } from "@/db/hall-schema";
import type { InferSelectModel } from "drizzle-orm";

type Movie = InferSelectModel<typeof movies>;
type Tag = InferSelectModel<typeof tags>;
type Hall = InferSelectModel<typeof halls>;

type HallMovie = {
  id: number;
  movieTitle: string;
  hallName: string;
  airingDate: string;
  airingTime: string | null;
  price: string;
};

type MovieTag = {
  id: number;
  movieId: number;
  tagId: number;
  movieTitle: string;
  tagName: string;
};

export default function AdminDashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false);
  const [editTagDialogOpen, setEditTagDialogOpen] = useState<number | null>(
    null,
  );
  const [hallMovies, setHallMovies] = useState<HallMovie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [createHallMovieDialogOpen, setCreateHallMovieDialogOpen] = useState(false);
  const [movieTags, setMovieTags] = useState<MovieTag[]>([]);
  const [createMovieTagDialogOpen, setCreateMovieTagDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [moviesRes, tagsRes, hallsRes, showtimesRes, movieTagsRes] =
        await Promise.all([
          fetch("/api/movies"),
          fetch("/api/tags"),
          fetch("/api/halls"),
          fetch("/api/hall-movies"),
          fetch("/api/movie-tags"),
        ]);

      if (
        !moviesRes.ok || !tagsRes.ok || !hallsRes.ok ||
        !showtimesRes.ok || !movieTagsRes.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const moviesData = await moviesRes.json();
      const tagsData = await tagsRes.json();
      const hallsData = await hallsRes.json();
      const showtimesData = await showtimesRes.json();
      const movieTagsData = await movieTagsRes.json();

      setMovies(moviesData);
      setTags(tagsData);
      setHalls(hallsData);
      setHallMovies(showtimesData);
      setMovieTags(movieTagsData);
      setLoading(false);
    } catch {
      setError("Failed to load data");
      setLoading(false);
    }
  }

  async function handleCreateTag(formData: FormData) {
    try {
      await createTag(formData);
      setSuccess("Tag created successfully");
      setError(null);
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
      setCreateTagDialogOpen(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create tag");
      setSuccess(null);
    }
  }

  async function handleUpdateTag(id: number, formData: FormData) {
    try {
      await updateTag(id, formData);
      setSuccess("Tag updated successfully");
      setError(null);
      setEditTagDialogOpen(null);
      await loadData();

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update tag");
      setSuccess(null);
    }
  }

  async function handleDeleteTag(id: number) {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      await deleteTag(id);
      setSuccess("Tag deleted successfully");
      setError(null);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete tag");
      setSuccess(null);
    }
  }

  async function handleCreate(formData: FormData) {
    try {
      await createMovie(formData);
      setSuccess("Movie created successfully");
      setError(null);
      setCreateDialogOpen(false);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create movie");
      setSuccess(null);
    }
  }

  async function handleUpdate(id: number, formData: FormData) {
    try {
      await updateMovie(id, formData);
      setSuccess("Movie updated successfully");
      setError(null);
      setEditDialogOpen(null);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update movie");
      setSuccess(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await deleteMovie(id);
      setSuccess("Movie deleted successfully");
      setError(null);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete movie");
      setSuccess(null);
    }
  }

  async function handleCreateHallMovie(formData: FormData) {
    try {
      await createHallMovie(formData);
      setSuccess("Showtime created successfully");
      setError(null);
      setCreateHallMovieDialogOpen(false);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create showtime");
      setSuccess(null);
    }
  }

  async function handleDeleteHallMovie(id: number) {
    if (!confirm("Are you sure you want to delete this showtime?")) return;

    try {
      await deleteHallMovie(id);
      setSuccess("Showtime deleted successfully");
      setError(null);
      await loadData();
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete showtime");
      setSuccess(null);
    }
  }

  async function handleCreateMovieTag(formData: FormData) {
    try {
      await createMovieTag(formData);
      setSuccess("Movie-tag association created");
      setError(null);
      setCreateMovieTagDialogOpen(false);
      await loadData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to associate tag");
      setSuccess(null);
    }
  }

  async function handleDeleteMovieTag(id: number) {
    if (!confirm("Remove this tag from the movie?")) return;
    try {
      await deleteMovieTag(id);
      setSuccess("Tag removed from movie");
      setError(null);
      await loadData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove tag");
      setSuccess(null);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-white text-black p-8">Loading...</div>
    );

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-black">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-black">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Admin Dashboard - Movies</h1>
            <Link
              href="/admin/reservations"
              className="text-sm text-gray-500 hover:text-black hover:cursor-pointer transition-colors underline underline-offset-2"
            >
              View Reservations
            </Link>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger>
              <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 border border-black px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                <Plus className="w-4 h-4" />
                Add Movie
              </span>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-black">
                  Create New Movie
                </DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div>
                  <label className="text-black block mb-2">Title</label>
                  <Input
                    name="title"
                    placeholder="Movie title"
                    required
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="text-black block mb-2">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Movie description"
                    required
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="text-black block mb-2">Poster Image</label>
                  <Input
                    name="poster"
                    type="file"
                    accept="image/*"
                    required
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="text-black block mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    name="duration"
                    type="number"
                    placeholder="120"
                    className="text-black"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Create Movie
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {movies.length === 0 ? (
          <Alert className="bg-gray-50 border-gray-200">
            <AlertDescription className="text-black">
              No movies found. Create your first movie above.
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="bg-white border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-black">Title</TableHead>
                  <TableHead className="text-black">Description</TableHead>
                  <TableHead className="text-black">Duration</TableHead>
                  <TableHead className="text-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow key={movie.id} className="border-gray-200">
                    <TableCell className="text-black font-medium">
                      {movie.title}
                    </TableCell>
                    <TableCell className="text-black max-w-xs truncate">
                      {movie.description}
                    </TableCell>
                    <TableCell className="text-black">
                      {movie.duration ? `${movie.duration} min` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={editDialogOpen === movie.id}
                          onOpenChange={(open) =>
                            setEditDialogOpen(open ? movie.id : null)
                          }
                        >
                          <DialogTrigger>
                            <span className="inline-flex items-center justify-center w-8 h-8 border border-black rounded-md hover:bg-gray-100 cursor-pointer">
                              <Pencil className="w-4 h-4" />
                            </span>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle className="text-black">
                                Edit Movie
                              </DialogTitle>
                            </DialogHeader>
                            <form
                              action={(formData) =>
                                handleUpdate(movie.id, formData)
                              }
                              className="space-y-4"
                            >
                              <div>
                                <label className="text-black block mb-2">
                                  Title
                                </label>
                                <Input
                                  name="title"
                                  defaultValue={movie.title}
                                  required
                                  className="text-black"
                                />
                              </div>
                              <div>
                                <label className="text-black block mb-2">
                                  Description
                                </label>
                                <Textarea
                                  name="description"
                                  defaultValue={movie.description}
                                  required
                                  className="text-black "
                                />
                              </div>
                              <div>
                                <label className="text-black block mb-2">
                                  Poster Image (leave empty to keep current)
                                </label>
                                <Input
                                  name="poster"
                                  type="file"
                                  accept="image/*"
                                  className="text-black"
                                />
                              </div>
                              <div>
                                <label className="text-black block mb-2">
                                  Duration (minutes)
                                </label>
                                <Input
                                  name="duration"
                                  type="number"
                                  defaultValue={movie.duration || ""}
                                  className="text-black"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="bg-black text-white "
                              >
                                Update Movie
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(movie.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Tags Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Manage Tags</h2>

            <Dialog
              open={createTagDialogOpen}
              onOpenChange={setCreateTagDialogOpen}
            >
              <DialogTrigger>
                <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 border border-black px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Tag
                </span>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black">
                    Create New Tag
                  </DialogTitle>
                </DialogHeader>
                <form action={handleCreateTag} className="space-y-4">
                  <div>
                    <label className="text-black block mb-2">Tag Name</label>
                    <Input
                      name="tag"
                      placeholder="Action, Drama, Comedy..."
                      required
                      className="text-black"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Create Tag
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {tags.length === 0 ? (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription className="text-black">
                No tags found. Create your first tag above.
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="bg-white border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">Tag Name</TableHead>
                    <TableHead className="text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id} className="border-gray-200">
                      <TableCell className="text-black font-medium">
                        {tag.tag}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog
                            open={editTagDialogOpen === tag.id}
                            onOpenChange={(open) =>
                              setEditTagDialogOpen(open ? tag.id : null)
                            }
                          >
                            <DialogTrigger>
                              <span className="inline-flex items-center justify-center w-8 h-8 border border-black rounded-md hover:bg-gray-100 cursor-pointer">
                                <Pencil className="w-4 h-4" />
                              </span>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle className="text-black">
                                  Edit Tag
                                </DialogTitle>
                              </DialogHeader>
                              <form
                                action={(formData) =>
                                  handleUpdateTag(tag.id, formData)
                                }
                                className="space-y-4"
                              >
                                <div>
                                  <label className="text-black block mb-2">
                                    Tag Name
                                  </label>
                                  <Input
                                    name="tag"
                                    defaultValue={tag.tag}
                                    required
                                    className="text-black"
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  className="bg-black text-white hover:bg-gray-800"
                                >
                                  Update Tag
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTag(tag.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        {/* Movie Tags Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Movie Tags</h2>

            <Dialog
              open={createMovieTagDialogOpen}
              onOpenChange={setCreateMovieTagDialogOpen}
            >
              <DialogTrigger>
                <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 border border-black px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Tag to Movie
                </span>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black">
                    Link Tag to Movie
                  </DialogTitle>
                </DialogHeader>
                <form action={handleCreateMovieTag} className="space-y-4">
                  <div>
                    <label className="text-black block mb-2">Movie</label>
                    <select
                      name="movieId"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white"
                    >
                      <option value="">Select a movie...</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-black block mb-2">Tag</label>
                    <select
                      name="tagId"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white"
                    >
                      <option value="">Select a tag...</option>
                      {tags.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Link Tag
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {movieTags.length === 0 ? (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription className="text-black">
                No movie-tag associations yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="bg-white border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">Movie</TableHead>
                    <TableHead className="text-black">Tag</TableHead>
                    <TableHead className="text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movieTags.map((mt) => (
                    <TableRow key={mt.id} className="border-gray-200">
                      <TableCell className="text-black font-medium">
                        {mt.movieTitle}
                      </TableCell>
                      <TableCell className="text-black">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium">
                          {mt.tagName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMovieTag(mt.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        {/* Showtimes Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Manage Showtimes</h2>

            <Dialog
              open={createHallMovieDialogOpen}
              onOpenChange={setCreateHallMovieDialogOpen}
            >
              <DialogTrigger>
                <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 border border-black px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Showtime
                </span>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black">
                    Create New Showtime
                  </DialogTitle>
                </DialogHeader>
                <form action={handleCreateHallMovie} className="space-y-4">
                  <div>
                    <label className="text-black block mb-2">Movie</label>
                    <select
                      name="movieId"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white"
                    >
                      <option value="">Select a movie...</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-black block mb-2">Hall</label>
                    <select
                      name="hallId"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white"
                    >
                      <option value="">Select a hall...</option>
                      {halls.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-black block mb-2">Date</label>
                    <Input
                      name="airingDate"
                      type="date"
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="text-black block mb-2">
                      Time (optional)
                    </label>
                    <Input
                      name="airingTime"
                      type="time"
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="text-black block mb-2">Price</label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="12.50"
                      required
                      className="text-black"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Create Showtime
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {hallMovies.length === 0 ? (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription className="text-black">
                No showtimes found. Create your first showtime above.
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="bg-white border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">Movie</TableHead>
                    <TableHead className="text-black">Hall</TableHead>
                    <TableHead className="text-black">Date</TableHead>
                    <TableHead className="text-black">Time</TableHead>
                    <TableHead className="text-black">Price</TableHead>
                    <TableHead className="text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hallMovies.map((sm) => (
                    <TableRow key={sm.id} className="border-gray-200">
                      <TableCell className="text-black font-medium">
                        {sm.movieTitle}
                      </TableCell>
                      <TableCell className="text-black">{sm.hallName}</TableCell>
                      <TableCell className="text-black">
                        {new Date(sm.airingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-black">
                        {sm.airingTime || "\u2014"}
                      </TableCell>
                      <TableCell className="text-black">
                        &euro;{sm.price}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteHallMovie(sm.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
