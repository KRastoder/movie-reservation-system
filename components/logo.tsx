import Link from "next/link";
export function Logo() {
  return (
    <h1 className="text-2xl font-bold tracking-tight text-black">
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity hover:cursor-pointer"
      >
        Book Movies
      </Link>
    </h1>
  );
}
