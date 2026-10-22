"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { CHURCH } from "@/lib/church";

const NAV_LINKS = [
  { href: "/", label: "Home" }, { href: "/about", label: "About" },
  { href: "/ministries", label: "Ministries" }, { href: "/events", label: "Events" },
  { href: "/live", label: "Live" }, { href: "/gallery", label: "Gallery" }, { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuPath(null); toggle.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-width flex items-center justify-between gap-4 h-20">
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label={`${CHURCH.shortName} home`} onClick={() => setMenuPath(null)}>
          <Image src="/images/logo.jpg" alt="EFPH Logo" width={44} height={44} sizes="44px" className="rounded-full ring-1 ring-white/15" />
          <span className="text-white font-semibold text-[13px] sm:text-sm leading-tight max-w-36 sm:max-w-none">{CHURCH.shortName}</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="nav-link">{link.label}</Link>)}
        </nav>
        <Link href="/give" className="btn-gold hidden xl:inline-flex text-xs px-5"><Heart size={15} />Give Online</Link>
        <button ref={toggle} type="button" className="xl:hidden text-white rounded-lg p-3 hover:bg-white/10" onClick={() => setMenuPath(open ? null : pathname)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && <nav id="mobile-menu" aria-label="Mobile navigation" className="mobile-menu xl:hidden">
        {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setMenuPath(null)} className="nav-link block py-3">{link.label}</Link>)}
        <Link href="/give" className="btn-gold mt-4 justify-center w-full text-sm" onClick={() => setMenuPath(null)}><Heart size={15} />Give Online</Link>
      </nav>}
    </header>
  );
}
