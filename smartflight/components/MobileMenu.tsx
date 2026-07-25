"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import type { User } from "firebase/auth";
import { auth, onAuthStateChanged, signOut } from "../lib/auth";

/**
 * Mobile-only nav drawer (hamburger). Desktop keeps the inline links +
 * AuthMenu; on phones those links were `hidden md:flex` and simply
 * unreachable, and the signed-in state was a bare avatar + Sign Out with no
 * identity. This drawer restores navigation AND gives a signed-in user their
 * name/email + a clear Sign out, in the same Civil Twilight dark glass.
 */
export function MobileMenu() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      close();
    }
  };

  const links: { href: string; label: string }[] = [
    { href: "/", label: t("home") },
    { href: "/booking", label: t("booking") },
    { href: "/deals", label: t("deals") },
    { href: "/blog", label: t("blog") },
  ];

  const label = user?.displayName || user?.email?.split("@")[0] || "";
  const initial = (label[0] ?? "?").toUpperCase();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
      >
        <Menu size={20} strokeWidth={2.2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t("menu")}
            onClick={close}
            className="absolute inset-0 h-full w-full bg-[rgba(6,10,22,0.6)] backdrop-blur-sm"
          />

          {/* Panel — slides in from the right */}
          <div className="glass-modal-dark animate-slide-in-right absolute right-0 top-0 flex h-full w-[82%] max-w-[340px] flex-col rounded-l-3xl p-5 text-[var(--paper-50)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="data-mono text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(143,224,232,0.75)]">
                {t("menu")}
              </span>
              <button
                type="button"
                aria-label={t("menu")}
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>

            {/* Identity (signed in) */}
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={label} width={44} height={44} className="h-11 w-11 rounded-full" />
                ) : (
                  <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-base font-bold text-white">
                    {initial}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.displayName || label}</p>
                  {user.email && <p className="truncate text-xs text-white/55">{user.email}</p>}
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-5">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {t("signOut")}
                </button>
              ) : (
                <Link
                  href="/signin"
                  onClick={close}
                  className="btn-sheen flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  {t("signIn")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
