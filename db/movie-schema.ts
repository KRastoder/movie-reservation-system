import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  serial,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  posterUrl: text("poster_url").notNull(),
  duration: integer("duration_minutes").notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 255 }).notNull(),
});

export const movieTags = pgTable("movie_tags", {
  id: serial("id").primaryKey(),
  tagId: integer("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
  movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
}, (table) => ({
  uniqueMovieTag: uniqueIndex("unique_movie_tag").on(table.movieId, table.tagId),
}));
