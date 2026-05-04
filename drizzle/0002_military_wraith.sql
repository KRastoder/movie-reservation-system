CREATE TABLE "movie_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag_id" varchar(255) NOT NULL,
	"movie_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"seat_id" integer NOT NULL,
	"hall_movie_id" integer NOT NULL,
	"available" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_layout" (
	"id" serial PRIMARY KEY NOT NULL,
	"hall_id" integer,
	"seat_rows" integer NOT NULL,
	"seat_cols" integer NOT NULL,
	"row_gap" integer[] NOT NULL,
	"col_gap" integer[] NOT NULL,
	CONSTRAINT "rows_gte_1" CHECK ("hall_layout"."seat_rows" >= 1),
	CONSTRAINT "cols_gte_1" CHECK ("hall_layout"."seat_cols" >= 1)
);
--> statement-breakpoint
CREATE TABLE "hall_movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer,
	"hall_id" integer,
	"airing_date" timestamp NOT NULL,
	"airing_time" varchar(5),
	"price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_seats" (
	"id" serial PRIMARY KEY NOT NULL,
	"hall_id" integer,
	"seat_number" integer
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_seat_id_hall_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."hall_seats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_hall_movie_id_hall_movies_id_fk" FOREIGN KEY ("hall_movie_id") REFERENCES "public"."hall_movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_layout" ADD CONSTRAINT "hall_layout_hall_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_movies" ADD CONSTRAINT "hall_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_movies" ADD CONSTRAINT "hall_movies_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_seats" ADD CONSTRAINT "hall_seats_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_seat_per_showing" ON "reservations" USING btree ("hall_movie_id","seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_hall_layout" ON "hall_layout" USING btree ("hall_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_seat_per_hall" ON "hall_seats" USING btree ("hall_id","seat_number");--> statement-breakpoint
ALTER TABLE "movies" DROP COLUMN "airing_date";--> statement-breakpoint
ALTER TABLE "movies" DROP COLUMN "airing_time";