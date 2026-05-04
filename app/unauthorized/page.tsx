import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <Card className="bg-white border-gray-200 p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
        <Link href="/">
          <Button className="bg-black text-white hover:bg-gray-800">
            Go Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
