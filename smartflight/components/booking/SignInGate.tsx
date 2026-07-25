"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "firebase/auth";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, authErrorMessage } from "../../lib/auth";

type SignInGateProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the freshly signed-in user so the caller can resume the
      pending booking action automatically. */
  onSignedIn: (user: User) => void;
};

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/12 text-[var(--paper-50)] placeholder-white/35 transition-colors focus:outline-none focus:border-[var(--contrail-300)] focus:bg-white/[0.09]";

/**
 * Booking gate: shown when a signed-out user clicks "Select" on a fare. Search
 * and browsing stay open — only the commit step is gated. On success it hands
 * the user back to the caller, which resumes the exact offer's checkout. Same
 * compact email/password + Google set as /signin, in the dark-glass language.
 */
export default function SignInGate({ open, onClose, onSignedIn }: SignInGateProps) {
  const t = useTranslations("SignIn");
  const tGate = useTranslations("Gate");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user =
        mode === "signup"
          ? await signUpWithEmail(email, password, name.trim() || undefined)
          : await signInWithEmail(email, password);
      onSignedIn(user);
    } catch (err) {
      console.error(`gate ${mode} failed:`, err);
      setError(authErrorMessage(err) ?? t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      if (user) onSignedIn(user); // null => popup-blocked redirect is navigating away
    } catch (err) {
      console.error("gate google failed:", err);
      setError(authErrorMessage(err) ?? t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[rgba(10,15,30,0.6)] backdrop-blur-sm sm:items-center">
      <div className="glass-modal-dark animate-fade-up max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 text-[var(--paper-50)] sm:rounded-3xl">
        <div className="mb-1 flex items-start justify-between">
          <h2 className="text-xl font-bold">{tGate("title")}</h2>
          <button
            type="button"
            aria-label={t("backToHome")}
            onClick={onClose}
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-5 text-sm text-white/60">{tGate("subtitle")}</p>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.06] p-1" role="tablist">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(""); }}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === m ? "bg-white/[0.14] text-white shadow-sm" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t(m === "login" ? "loginTab" : "signupTab")}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/[0.12] p-3.5 text-sm text-red-200" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleEmail} className="space-y-3.5">
          {mode === "signup" && (
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              aria-label={t("nameLabel")}
              className={inputClass}
            />
          )}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-label={t("emailLabel")}
            className={inputClass}
          />
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            aria-label={t("passwordLabel")}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-sheen min-h-[48px] w-full rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("submitting") : mode === "signup" ? t("signupButton") : t("loginButton")}
          </button>
        </form>

        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/12" />
          <span className="text-sm text-white/40">{t("orDivider")}</span>
          <div className="h-px flex-1 bg-white/12" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.07] px-6 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? t("signingIn") : t("continueWithGoogle")}
        </button>
      </div>
    </div>
  );
}
