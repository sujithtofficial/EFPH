"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHURCH } from "@/lib/church";

const NAV_LINKS = [
  { href: "/",           label: "Home" },
  { href: "/about",      label: "About" },
  { href: "/ministries", label: "Ministries" },
  { href: "/events",     label: "Events" },
  { href: "/live",       label: "Live" },
  { href: "/gallery",    label: "Gallery" },
  { href: "/contact",    label: "Contact" },
];

export default function Navbar() {
  const pathname   = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-[#0f172a]/95 backdrop-blur-md shadow-lg"
      )}
    >
      <div className="container-xl flex items-center justify-between h-20 px-4 md:px-8 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/images/logo.jpg" alt="EFPH Logo" width={44} height={44} className="rounded-full" />
          <div className="hidden sm:block">
            <span className="text-white font-bold text-sm leading-tight block">
              {CHURCH.shortName}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200",
                pathname === link.href
                  ? "text-[#b0925e]"
                  : "text-gray-300 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Give CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/give" className="btn-gold text-sm py-2.5 px-5 gap-1.5">
            <Heart size={15} strokeWidth={2.5} />
            Give Online
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0f172a] border-t border-white/10 px-4 pb-6">
          <nav className="flex flex-col gap-1 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-sm transition-colors",
                  pathname === link.href
                    ? "text-[#b0925e] bg-white/5"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/give"
              className="btn-gold mt-3 justify-center text-sm"
            >
              <Heart size={15} strokeWidth={2.5} />
              Give Online
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
