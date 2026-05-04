"use client";

import { useState, useEffect } from "react";
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
} from "./movie-server-actions";
import { movies, tags } from "@/db/movie-schema";
import type { InferSelectModel } from "drizzle-orm";

type Movie = InferSelectModel<typeof movies>;
type Tag = InferSelectModel<typeof tags>;

export default function AdminDashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<number | null>(null);
  const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false);
  const [editTagDialogOpen, setEditTagDialogOpen] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [moviesRes, tagsRes] = await Promise.all([
        fetch("/api/movies"),
        fetch("/api/tags"),
      ]);
      
      if (!moviesRes.ok || !tagsRes.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const moviesData = await moviesRes.json();
      const tagsData = await tagsRes.json();
      
      setMovies(moviesData);
      setTags(tagsData);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete movie");
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
          <h1 className="text-3xl font-bold">Admin Dashboard - Movies</h1>

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
            
            <Dialog open={createTagDialogOpen} onOpenChange={setCreateTagDialogOpen}>
              <DialogTrigger>
                <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 border border-black px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Add Tag
                </span>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black">Create New Tag</DialogTitle>
                </DialogHeader>
                <form action={handleCreateTag} className="space-y-4">
                  <div>
                    <label className="text-black block mb-2">Tag Name</label>
                    <Input name="tag" placeholder="Action, Drama, Comedy..." required className="text-black" />
                  </div>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
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
                      <TableCell className="text-black font-medium">{tag.tag}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={editTagDialogOpen === tag.id} onOpenChange={(open) => setEditTagDialogOpen(open ? tag.id : null)}>
                            <DialogTrigger>
                              <span className="inline-flex items-center justify-center w-8 h-8 border border-black rounded-md hover:bg-gray-100 cursor-pointer">
                                <Pencil className="w-4 h-4" />
                              </span>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle className="text-black">Edit Tag</DialogTitle>
                              </DialogHeader>
                              <form
                                action={(formData) => handleUpdateTag(tag.id, formData)}
                                className="space-y-4"
                              >
                                <div>
                                  <label className="text-black block mb-2">Tag Name</label>
                                  <Input name="tag" defaultValue={tag.tag} required className="text-black" />
                                </div>
                                <Button type="submit" className="bg-black text-white hover:bg-gray-800">
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
      </div>
    </div>
  );
}
