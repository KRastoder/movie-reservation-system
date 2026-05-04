import { Logo } from "@/components/logo"
import { NavbarClient } from "@/components/navbar-client"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Client-side navigation (session-aware) */}
        <NavbarClient />
      </div>
    </nav>
  )
}
