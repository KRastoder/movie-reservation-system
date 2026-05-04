import {
  pgTable,
  varchar,
  timestamp,
  integer,
  decimal,
  serial,
  text,
  boolean,
  uniqueIndex,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { movies } from "./movie-schema";
import { user } from "./auth-schema";

export const halls = pgTable("halls", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hallLayout = pgTable(
  "hall_layout",
  {
    id: serial("id").primaryKey(),
    hallId: integer("hall_id"),
    seatRows: integer("seat_rows").notNull(),
    seatCols: integer("seat_cols").notNull(),
    rowGap: integer("row_gap").array().notNull(),
    colGap: integer("col_gap").array().notNull(),
  },
  (table) => ({
    rowsCheck: check("rows_gte_1", sql`${table.seatRows} >= 1`),
    colsCheck: check("cols_gte_1", sql`${table.seatCols} >= 1`),
    uniqueHallLayout: uniqueIndex("unique_hall_layout").on(table.hallId),
    hallRef: foreignKey({
      columns: [table.hallId],
      foreignColumns: [halls.id],
      name: "hall_layout_hall_id_fk",
    }).onDelete("cascade"),
  }),
);

export const hallMovies = pgTable("hall_movies", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").references(() => movies.id, {
    onDelete: "cascade",
  }),
  hallId: integer("hall_id").references(() => halls.id, {
    onDelete: "cascade",
  }),
  airingDate: timestamp("airing_date").notNull(),
  airingTime: varchar("airing_time", { length: 5 }),
  price: decimal("price").notNull(),
});

export const hallSeats = pgTable(
  "hall_seats",
  {
    id: serial("id").primaryKey(),
    hallId: integer("hall_id").references(() => halls.id, {
      onDelete: "cascade",
    }),
    seatNumber: integer("seat_number"),
  },
  (table) => ({
    uniqueSeatPerHall: uniqueIndex("unique_seat_per_hall").on(
      table.hallId,
      table.seatNumber,
    ),
  }),
);

export const reservations = pgTable(
  "reservations",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    seatId: integer("seat_id")
      .references(() => hallSeats.id, { onDelete: "cascade" })
      .notNull(),
    hallMovieId: integer("hall_movie_id")
      .references(() => hallMovies.id, { onDelete: "cascade" })
      .notNull(),
    available: boolean("available").default(true).notNull(),
  },
  (table) => ({
    uniqueSeatPerShowing: uniqueIndex("unique_seat_per_showing").on(
      table.hallMovieId,
      table.seatId,
    ),
  }),
);
