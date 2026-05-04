"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, X } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export function NavbarClient() {
  const { data: session, isPending } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:gap-6">
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-black/60" />
        ) : session ? (
          <>
            <Link
              href="/movies"
              className="text-sm font-medium text-black/70 transition-colors hover:text-black hover:cursor-pointer"
            >
              Movies
            </Link>
            <Button
              variant="secondary"
              type="button"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-black/70 transition-colors hover:text-black hover:cursor-pointer"
            >
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:cursor-pointer">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden hover:cursor-pointer"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-black" />
        ) : (
          <Menu className="h-6 w-6 text-black" />
        )}
      </button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4 sm:px-6">
            {isPending ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-black/60" />
              </div>
              ) : session ? (
                <>
                  <Link
                    href="/movies"
                    className="block text-sm font-medium text-black/70 transition-colors hover:text-black hover:cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Movies
                  </Link>
                  <Button
                    variant="secondary"
                    className="w-full justify-start hover:cursor-pointer"
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
              <>
                <Link
                  href="/sign-in"
                  className="block text-sm font-medium text-black/70 transition-colors hover:text-black hover:cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:cursor-pointer"
                >
                  <Button className="w-full hover:cursor-pointer">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
