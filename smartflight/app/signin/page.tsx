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
      className="object-cover object-center"
      sizes="(max-width: 768px) 160px, 220px"
      priority
      quality={100}
    />
  </div>
);

type Mode = "login" | "signup" | "reset";

const inputClass =
  "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-700">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <BrandLogo className="h-10 w-36 md:h-11 md:w-44" />
          </Link>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {mode !== "reset" && (
            <div className="mb-6 grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl" role="tablist">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t(m === "login" ? "loginTab" : "signupTab")}
                </button>
              ))}
            </div>
          )}

          <h2 className={`text-2xl font-bold text-gray-900 text-center ${mode === "reset" ? "mb-2" : "mb-6"}`}>
            {mode === "login" && t("welcomeBack")}
            {mode === "signup" && t("createAccount")}
            {mode === "reset" && t("resetTitle")}
          </h2>
          {mode === "reset" && (
            <p className="text-sm text-gray-500 mb-6 text-center">{t("resetInfo")}</p>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {notice}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t("passwordLabel")}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">{t("orDivider")}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? t("signingIn") : t("continueWithGoogle")}
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>{t("terms")}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
