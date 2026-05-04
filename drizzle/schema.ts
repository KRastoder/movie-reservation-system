import { pgTable, index, text, timestamp, foreignKey, unique, boolean, varchar, integer, serial, check, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: text(),
	banned: boolean().default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const movies = pgTable("movies", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	posterUrl: text("poster_url").notNull(),
	airingDate: timestamp("airing_date", { mode: 'string' }).notNull(),
	airingTime: varchar("airing_time", { length: 5 }),
	durationMinutes: integer("duration_minutes"),
});

export const movieTags = pgTable("movie_tags", {
	id: serial().primaryKey().notNull(),
	tagId: varchar("tag_id", { length: 255 }).notNull(),
	movieId: varchar("movie_id", { length: 255 }).notNull(),
});

export const reservations = pgTable("reservations", {
	id: serial().primaryKey().notNull(),
	movieId: varchar("movie_id", { length: 255 }).notNull(),
	userId: text("user_id").notNull(),
	seatNumber: integer("seat_number").notNull(),
});

export const tags = pgTable("tags", {
	id: serial().primaryKey().notNull(),
	tag: varchar({ length: 255 }).notNull(),
});

export const hallLayout = pgTable("hall_layout", {
	id: serial().primaryKey().notNull(),
	hallId: integer("hall_id"),
	seatRows: integer("seat_rows").notNull(),
	seatCols: integer("seat_cols").notNull(),
	rowGap: integer("row_gap").array().notNull(),
	colGap: integer("col_gap").array().notNull(),
}, (table) => [
	check("rows_gte_1", sql`seat_rows >= 1`),
	check("cols_gte_1", sql`seat_cols >= 1`),
]);

export const hallMovies = pgTable("hall_movies", {
	id: serial().primaryKey().notNull(),
	movieId: integer("movie_id"),
	hallId: integer("hall_id"),
	airingDate: timestamp("airing_date", { mode: 'string' }).notNull(),
	airingTime: varchar("airing_time", { length: 5 }),
	price: numeric().notNull(),
});

export const hallSeats = pgTable("hall_seats", {
	id: serial().primaryKey().notNull(),
	hallId: integer("hall_id"),
	seatNumber: integer("seat_number"),
});

export const halls = pgTable("halls", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	city: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
