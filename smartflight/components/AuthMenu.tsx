"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { User } from "firebase/auth";
import { auth, onAuthStateChanged, handleRedirectResult, signInWithGoogle, signOut } from "../lib/auth";

type AuthMenuProps = {
  /** Matches the dark-nav-over-hero styling variant used on the homepage; booking page always passes false (light nav). */
  dark?: boolean;
};

export function AuthMenu({ dark }: AuthMenuProps) {
  const t = useTranslations("Nav");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Explicitly consume the pending redirect result (not just relying on
    // onAuthStateChanged) — this is the step app/signin/page.tsx was
    // missing, which could leave a just-completed Google sign-in from
    // that page looking like it silently failed.
    handleRedirectResult()
      .then((u) => {
        if (u) setUser(u);
      })
      .catch((err) => {
        // No persistent error UI in the nav — log for now. The dedicated
        // /signin page shows this to the user directly.
        console.error("Redirect sign-in failed:", err);
      });
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (user) {
    // Email/password accounts often have no displayName or photo —
    // fall back to the email local-part and an initial chip so the
    // header always shows who is signed in.
    const label = user.displayName || user.email?.split("@")[0] || "";
    const initial = (label[0] ?? "?").toUpperCase();
    return (
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <Image src={user.photoURL} alt={label} width={32} height={32} className="rounded-full" />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              dark ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
            }`}
          >
            {initial}
          </span>
        )}
        <span className={`hidden sm:inline text-sm transition ${dark ? "text-white/70" : "text-muted"}`}>
          {label}
        </span>
        <button
          onClick={handleSignOut}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            dark
              ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
              : "glass-chip text-foreground hover:bg-white/80"
          }`}
        >
          {t("signOut")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="btn-sheen px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25"
    >
      {t("signIn")}
    </button>
  );
}
