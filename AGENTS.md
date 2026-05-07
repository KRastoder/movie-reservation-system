# Movie Reservation System — Agent Context

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16 (Docker), Drizzle ORM
- **Auth:** Better Auth (email/password + admin plugin)
- **UI:** Tailwind CSS v4, shadcn/ui v4 (base-nova style), lucide-react icons
- **Validation:** Zod 4
- **Forms:** react-hook-form (auth pages), native FormData + server actions (admin)

## Path Aliases
- `@/*` → project root

## Directory Structure

```
app/
  page.tsx                          # Landing page — hero, 5 upcoming showtimes, CTA
  layout.tsx                        # Root layout — Navbar + Geist fonts
  globals.css                       # Tailwind v4 + shadcn theme tokens

  admin/
    page.tsx                        # Admin dashboard — Movies, Tags, Movie Tags, Showtimes CRUD
    movie-server-actions.ts         # create/update/delete Movie, Tag, MovieTag
    hall-server-actions.ts          # createHall (hall + layout + seats in transaction)
    hall-movie-server-actions.ts    # create/delete HallMovie (showtime)
    create-hall/
      page.tsx                      # Hall creation page with live seat preview
      hall-form.tsx                 # Form + seat grid preview client component
    reservations/
      page.tsx                      # All reservations table (read-only)

  api/
    movies/route.ts                 # GET all movies
    movies/[slug]/route.ts          # GET showtimes for a movie
    tags/route.ts                   # GET all tags
    movie-tags/route.ts             # GET all movie-tag associations
    halls/route.ts                  # GET all halls
    hall-movies/route.ts            # GET all showtimes with movie + hall info
    seats/[slug]/route.ts           # GET seats for a hall (note: uses hallId, buggy)
    showtimes/[id]/seats/route.ts   # GET seats + layout + reservation status for a showtime

  movies/
    page.tsx                        # All movies page — all showtimes, sort + tag filter
    movies-client.tsx               # Sort/filter client component
    [slug]/page.tsx                 # Movie detail + showtime picker

  show/[id]/
    page.tsx                        # Showtime detail — poster, info, tags, seat picker
    seat-picker.tsx                 # Interactive seat grid + confirm dialog + reserve

  sign-in/page.tsx, sign-up/page.tsx, unauthorized/page.tsx

components/
  ui/                               # shadcn components: button, input, card, dialog, table, alert, label, textarea
  navbar.tsx                        # Server nav wrapper
  navbar-client.tsx                 # Client nav (session-aware, mobile menu)
  logo.tsx

db/
  index.ts                          # Drizzle client (node-postgres Pool)
  hall-schema.ts                    # halls, hallLayout, hallMovies, hallSeats, reservations
  movie-schema.ts                   # movies, tags, movieTags
  auth-schema.ts                    # user, session, account, verification
  relations.ts                      # All Drizzle relations

lib/
  auth.ts                           # Better Auth server config
  auth-client.ts                    # Better Auth client (useSession, signIn, signOut)
  utils.ts                          # cn() utility

server-actions/
  auth.ts                           # signOutAction

reservation-server-actions.ts       # createReservation (auth guard, duplicate check)
```

## Database Schema (key tables)

### movies
id (serial PK), title (varchar 255), description (text), createdAt (timestamp), posterUrl (text), duration (int)

### tags
id (serial PK), tag (varchar 255)

### movieTags — junction table
id (serial PK), movieId (FK→movies), tagId (FK→tags), UNIQUE(movieId, tagId)

### halls
id (serial PK), name (varchar 255), city (varchar 255), address (varchar 255), createdAt (timestamp)

### hallLayout — 1:1 with halls
id (serial PK), hallId (FK→halls, unique), seatRows (int), seatCols (int), rowGap (int[]), colGap (int[])

### hallMovies — showtimes
id (serial PK), movieId (FK→movies), hallId (FK→halls), airingDate (timestamp), airingTime (varchar 5), price (decimal)

### hallSeats
id (serial PK), hallId (FK→halls), seatNumber (int), UNIQUE(hallId, seatNumber)

### reservations
id (serial PK), userId (text FK→user), seatId (int FK→hallSeats), hallMovieId (int FK→hallMovies), available (boolean default true), UNIQUE(hallMovieId, seatId)

## Key Patterns

### Server actions
- Files named `*-server-actions.ts` with `"use server"` directive
- Use `FormData` for params, throw `Error` on failure
- Call `revalidatePath()` after mutations
- DB transactions via `db.transaction(async (tx) => { ... })`

### Data fetching
- Server components query DB directly (import `db` from `@/db`)
- Client components use `fetch("/api/...")` in `useEffect`
- Admin dashboard fetches all data on mount via Promise.all

### Auth
- Server: `auth.api.getSession({ headers: await headers() })`
- Client: `useSession()` from `@/lib/auth-client`
- User role column exists but not enforced yet

### Forms
- Admin: native `<form action={handler}>` with FormData
- Auth pages: react-hook-form + Zod resolver

### Styling
- Color scheme: white bg, black text, emerald for accents
- Layout: `min-h-screen bg-white text-black p-8`, `max-w-6xl mx-auto`
- Cards: `bg-white border-gray-200`
- Alerts: destructive variant for errors, green border for success

## Admin Pages
- `/admin` — Dashboard: Movies, Tags, Movie Tags, Showtimes CRUD
- `/admin/create-hall` — Hall creation with live seat preview
- `/admin/reservations` — View all reservations

## Public Pages
- `/` — Landing page hero + 5 upcoming showtimes
- `/movies` — All showtimes with sort + tag filter
- `/movies/[slug]` — Movie detail + showtime list
- `/show/[id]` — Showtime detail + interactive seat picker + reservation
`