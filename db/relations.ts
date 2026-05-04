import { relations } from "drizzle-orm/relations";
import { user, account, session } from "./auth-schema";
import { movies, tags, movieTags } from "./movie-schema";
import { halls, hallLayout, hallMovies, hallSeats, reservations } from "./hall-schema";

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  reservations: many(reservations),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  movieTags: many(movieTags),
  hallMovies: many(hallMovies),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  movieTags: many(movieTags),
}));

export const movieTagsRelations = relations(movieTags, ({ one }) => ({
  movie: one(movies, {
    fields: [movieTags.movieId],
    references: [movies.id],
  }),
  tag: one(tags, {
    fields: [movieTags.tagId],
    references: [tags.id],
  }),
}));

export const hallsRelations = relations(halls, ({ one, many }) => ({
  layout: one(hallLayout),
  hallMovies: many(hallMovies),
  hallSeats: many(hallSeats),
}));

export const hallLayoutRelations = relations(hallLayout, ({ one }) => ({
  hall: one(halls, {
    fields: [hallLayout.hallId],
    references: [halls.id],
  }),
}));

export const hallMoviesRelations = relations(hallMovies, ({ one, many }) => ({
  hall: one(halls, {
    fields: [hallMovies.hallId],
    references: [halls.id],
  }),
  movie: one(movies, {
    fields: [hallMovies.movieId],
    references: [movies.id],
  }),
  reservations: many(reservations),
}));

export const hallSeatsRelations = relations(hallSeats, ({ one, many }) => ({
  hall: one(halls, {
    fields: [hallSeats.hallId],
    references: [halls.id],
  }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(user, {
    fields: [reservations.userId],
    references: [user.id],
  }),
  seat: one(hallSeats, {
    fields: [reservations.seatId],
    references: [hallSeats.id],
  }),
  hallMovie: one(hallMovies, {
    fields: [reservations.hallMovieId],
    references: [hallMovies.id],
  }),
}));
