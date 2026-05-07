"use server";

import { db } from "@/db";
import { movies, tags, movieTags } from "@/db/movie-schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { writeFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1),
});

const tagSchema = z.object({
  tag: z.string().min(1, "Tag name is required").max(255),
});

export async function createMovie(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const posterFile = formData.get("poster") as File;
    const duration = formData.get("duration") as string;

    if (!posterFile || posterFile.size === 0) {
      throw new Error("Poster image is required");
    }

    if (!posterFile.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum < 1) {
      throw new Error("Duration must be a valid number greater than 0");
    }
    
    const validated = movieSchema.parse({
      title,
      description,
      duration: durationNum,
    });

    const bytes = await posterFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${posterFile.name}`;
    const path = join(process.cwd(), "public/uploads", filename);
    
    await writeFile(path, buffer);
    
    await db.insert(movies).values({
      title: validated.title,
      description: validated.description,
      posterUrl: `/uploads/${filename}`,
      duration: validated.duration,
    });
    
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues.map((e) => e.message).join(", "));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create movie");
  }
}

export async function updateMovie(id: number, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const posterFile = formData.get("poster") as File;
    const duration = formData.get("duration") as string;

    const durationNum = parseInt(duration);
    
    if (isNaN(durationNum) || durationNum < 1) {
      throw new Error("Duration must be a valid number greater than 0");
    }
    
    const validated = movieSchema.parse({
      title,
      description,
      duration: durationNum,
    });

    const updateData: Partial<typeof movies.$inferInsert> = {
      title: validated.title,
      description: validated.description,
      duration: validated.duration,
    };
    
    if (posterFile && posterFile.size > 0) {
      if (!posterFile.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }
      
      const bytes = await posterFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${posterFile.name}`;
      const path = join(process.cwd(), "public/uploads", filename);
      
      await writeFile(path, buffer);
      updateData.posterUrl = `/uploads/${filename}`;
    }

    await db
      .update(movies)
      .set(updateData)
      .where(eq(movies.id, id));
    
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues.map((e) => e.message).join(", "));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update movie");
  }
}

export async function deleteMovie(id: number) {
  try {
    if (!id || id < 1) {
      throw new Error("Invalid movie ID");
    }
    
    await db.delete(movies).where(eq(movies.id, id));
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete movie");
  }
}

export async function createTag(formData: FormData) {
  try {
    const tag = formData.get("tag") as string;
    
    const validated = tagSchema.parse({ tag });
    
    await db.insert(tags).values({ tag: validated.tag });
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues.map((e) => e.message).join(", "));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create tag");
  }
}

export async function updateTag(id: number, formData: FormData) {
  try {
    const tag = formData.get("tag") as string;
    
    const validated = tagSchema.parse({ tag });
    
    await db
      .update(tags)
      .set({ tag: validated.tag })
      .where(eq(tags.id, id));
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues.map((e) => e.message).join(", "));
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update tag");
  }
}

export async function deleteTag(id: number) {
  try {
    if (!id || id < 1) {
      throw new Error("Invalid tag ID");
    }
    
    await db.delete(movieTags).where(eq(movieTags.tagId, id));
    await db.delete(tags).where(eq(tags.id, id));
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete tag");
  }
}

export async function createMovieTag(formData: FormData) {
  try {
    const movieId = parseInt(formData.get("movieId") as string);
    const tagId = parseInt(formData.get("tagId") as string);

    if (isNaN(movieId) || isNaN(tagId)) {
      throw new Error("Invalid movie or tag");
    }

    const existing = await db
      .select({ id: movieTags.id })
      .from(movieTags)
      .where(
        and(eq(movieTags.movieId, movieId), eq(movieTags.tagId, tagId)),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("This movie already has this tag");
    }

    await db.insert(movieTags).values({ movieId, tagId });
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to create movie-tag association");
  }
}

export async function deleteMovieTag(id: number) {
  try {
    if (!id || id < 1) throw new Error("Invalid ID");
    await db.delete(movieTags).where(eq(movieTags.id, id));
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to delete movie-tag association");
  }
}
