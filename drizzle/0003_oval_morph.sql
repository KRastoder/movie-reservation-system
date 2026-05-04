ALTER TABLE "movie_tags" ALTER COLUMN "tag_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "movie_tags" ALTER COLUMN "movie_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "movie_tags" ADD CONSTRAINT "movie_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_tags" ADD CONSTRAINT "movie_tags_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_movie_tag" ON "movie_tags" USING btree ("movie_id","tag_id");