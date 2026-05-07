import Link from "next/link";
import HallForm from "./hall-form";

export const metadata = {
  title: "Create Hall - Admin",
};

export default function CreateHallPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          &larr; Back to Admin
        </Link>
        <HallForm />
      </div>
    </div>
  );
}
