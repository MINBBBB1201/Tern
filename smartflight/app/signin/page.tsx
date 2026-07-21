"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  auth,
  onAuthStateChanged,
  handleRedirectResult,
  authErrorMessage,
} from "../../lib/auth";
import type { User } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";

const BrandLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <Image
      src="/logos/tern-logo-purepick.png"
      alt="Tern"
      fill
      /* brightness-0 invert: the mark goes white against the twilight,
         the same treatment the dark-nav logo uses site-wide. */
      className="object-cover object-center brightness-0 invert"
      sizes="(max-width: 768px) 160px, 220px"
      priority
      quality={100}
    />
  </div>
);

type Mode = "login" | "signup" | "reset";

/* F3: dark auth inputs — a whisper of glass fill, contrail focus rim,
   paper text. Replaces the light indigo-focus inputs. */
const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/12 text-[var(--paper-50)] placeholder-white/35 transition-colors focus:outline-none focus:border-[var(--contrail-300)] focus:bg-white/[0.09]";

/* The twilight identity, shared with the hero and the SubpageShell band:
   deep ink→dusk with a warm horizon glow low on the page. */
const twilightBg =
  "radial-gradient(ellipse 80% 60% at 50% 112%, rgba(242,147,77,0.16) 0%, transparent 60%), linear-gradient(180deg, var(--ink-900) 0%, var(--dusk-700) 100%)";

export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations("SignIn");
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    handleRedirectResult().then((u) => {
      if (u) setUser(u);
    }).catch((err) => {
      console.error("Redirect sign-in failed:", err);
      setError(authErrorMessage(err) ?? t("genericError"));
    });
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router, t]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      // Popup flow resolves with the signed-in user (or null if the user
      // dismissed the popup / a redirect fallback is navigating away).
      const u = await signInWithGoogle();
      if (u) router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError(authErrorMessage(err) ?? t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setNotice(t("resetSent"));
      } else if (mode === "signup") {
        await signUpWithEmail(email, password, name.trim() || undefined);
        router.push("/");
      } else {
        await signInWithEmail(email, password);
        router.push("/");
      }
    } catch (err) {
      console.error(`${mode} failed:`, err);
      setError(authErrorMessage(err) ?? t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="night-tail min-h-screen flex items-center justify-center p-4" style={{ background: twilightBg }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: "rgba(246,248,251,0.75)" }}>{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="night-tail relative min-h-screen flex items-center justify-center overflow-hidden p-4" style={{ background: twilightBg }}>
      {/* Same drifting star texture as the hero night sky. */}
      <div className="hero-stars" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <BrandLogo className="h-10 w-36 md:h-11 md:w-44" />
          </Link>
          <p className="mt-3" style={{ color: "rgba(246,248,251,0.6)" }}>{t("subtitle")}</p>
        </div>

        <div className="glass-modal-dark rounded-3xl p-8">
          {mode !== "reset" && (
            <div className="mb-6 grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.06]" role="tablist">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-white/[0.14] text-white shadow-sm"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {t(m === "login" ? "loginTab" : "signupTab")}
                </button>
              ))}
            </div>
          )}

          <h2 className={`text-2xl font-bold text-center text-[var(--paper-50)] ${mode === "reset" ? "mb-2" : "mb-6"}`}>
            {mode === "login" && t("welcomeBack")}
            {mode === "signup" && t("createAccount")}
            {mode === "reset" && t("resetTitle")}
          </h2>
          {mode === "reset" && (
            <p className="text-sm mb-6 text-center" style={{ color: "rgba(246,248,251,0.55)" }}>{t("resetInfo")}</p>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-xl border text-sm bg-red-500/[0.12] border-red-400/30 text-red-200">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 p-4 rounded-xl border text-sm bg-emerald-500/[0.12] border-emerald-400/30 text-emerald-200">
              {notice}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-white/70">
                  {t("nameLabel")}
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-white/70">
                {t("emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className={inputClass}
              />
            </div>

            {mode !== "reset" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-white/70">
                    {t("passwordLabel")}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-sm font-medium text-[var(--contrail-300)] hover:text-white transition-colors"
                    >
                      {t("forgotPassword")}
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className={inputClass}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-sheen w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {loading
                ? t("submitting")
                : mode === "reset"
                  ? t("resetButton")
                  : mode === "signup"
                    ? t("signupButton")
                    : t("loginButton")}
            </button>
          </form>

          {mode === "reset" ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/12" />
                <span className="text-sm text-white/40">{t("orDivider")}</span>
                <div className="flex-1 h-px bg-white/12" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white/[0.07] border border-white/12 hover:bg-white/[0.12] hover:border-white/20"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? t("signingIn") : t("continueWithGoogle")}
              </button>

              <div className="mt-6 text-center text-sm text-white/45">
                <p>{t("terms")}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="font-medium text-white/60 hover:text-white transition-colors">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
