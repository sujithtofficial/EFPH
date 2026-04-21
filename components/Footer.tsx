import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { CHURCH } from "@/lib/church";

// Inline SVG brand icons (lucide-react does not export Facebook/Youtube/Instagram)
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1e] text-gray-300">
      <div className="container-xl section-pad">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm bg-[#b0925e] flex items-center justify-center font-bold text-white text-lg">
                E
              </div>
              <div>
                <span className="text-white font-bold text-sm block leading-tight">{CHURCH.shortName}</span>
                <span className="text-[#b0925e] text-xs tracking-widest uppercase">Church</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {CHURCH.description}
            </p>
            <div className="flex gap-3">
              <a href={CHURCH.social.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/10 hover:bg-[#b0925e] flex items-center justify-center transition-colors">
                <FacebookIcon />
              </a>
              <a href={CHURCH.social.youtube} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/10 hover:bg-[#b0925e] flex items-center justify-center transition-colors">
                <YoutubeIcon />
              </a>
              <a href={CHURCH.social.instagram} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/10 hover:bg-[#b0925e] flex items-center justify-center transition-colors">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-[#b0925e]/30">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Ministries", "/ministries"],
                ["Events", "/events"],
                ["Live Stream", "/live"],
                ["Gallery", "/gallery"],
                ["Give Online", "/give"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-gray-400 hover:text-[#b0925e] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#b0925e]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-[#b0925e]/30">
              Service Times
            </h3>
            <ul className="space-y-4">
              {CHURCH.services.map((s, i) => (
                <li key={i} className="text-sm">
                  <span className="text-[#b0925e] font-semibold block">{s.day}</span>
                  <span className="text-gray-400">{s.time} — {s.lang}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-[#b0925e]/30">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-[#b0925e] shrink-0 mt-0.5" />
                <span>{CHURCH.address}</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Phone size={16} className="text-[#b0925e] shrink-0" />
                <a href={`tel:${CHURCH.phone}`} className="text-gray-400 hover:text-[#b0925e] transition-colors">
                  {CHURCH.phone}
                </a>
              </li>
              <li className="flex gap-3 text-sm">
                <Mail size={16} className="text-[#b0925e] shrink-0" />
                <a href={`mailto:${CHURCH.email}`} className="text-gray-400 hover:text-[#b0925e] transition-colors">
                  {CHURCH.email}
                </a>
              </li>
              <li className="flex gap-3 text-sm">
                <Clock size={16} className="text-[#b0925e] shrink-0" />
                <span className="text-gray-400">{CHURCH.hours}</span>
              </li>
              <li>
                <a
                  href={CHURCH.mapDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#b0925e] hover:text-white transition-colors mt-1"
                >
                  <Navigation size={14} /> Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-xl flex flex-col sm:flex-row items-center justify-between gap-3 py-5 px-4 md:px-8 lg:px-16">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {CHURCH.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy-policy" className="hover:text-[#b0925e] transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-[#b0925e] transition-colors">Terms &amp; Conditions</Link>
            <span>·</span>
            <Link href="/give" className="text-[#b0925e] hover:underline">Give Online</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
