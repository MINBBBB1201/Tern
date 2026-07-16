import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// Always show the account chooser — silently reusing the last Google
// session confuses users who expected to pick an account.
provider.setCustomParameters({ prompt: "select_account" });

/**
 * Google sign-in, popup-first.
 *
 * Why popup and not redirect: with the default `authDomain`
 * (<project>.firebaseapp.com) the redirect flow stores its result under
 * that third-party origin, and modern browsers (Chrome 115+ storage
 * partitioning, Safari ITP) block the app origin (flytern.site,
 * localhost) from reading it — `getRedirectResult` resolves null and the
 * sign-in appears to hang forever with no error. Popup keeps the whole
 * handshake in a first-party window and works without proxying the auth
 * handler. Redirect remains only as a fallback for environments that
 * hard-block popups.
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    const code = (err as AuthError).code;
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null; // page is navigating away
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null; // user dismissed — not an error worth surfacing
    }
    throw err;
  }
}

/** Consume a pending redirect result (popup-blocked fallback path). */
export async function handleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result ? result.user : null;
}

/** Create a new account with email + password (the "Sign up" flow). */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

/** Sign in to an existing account with email + password (the "Log in" flow). */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getUser(): User | null {
  return auth.currentUser;
}

/** Human-readable message for the auth error codes users actually hit. */
export function authErrorMessage(err: unknown): string | null {
  const code = (err as AuthError)?.code;
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. (Firebase console → Authentication → Settings → Authorized domains)";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled for the project. (Firebase console → Authentication → Sign-in method)";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists — try logging in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/too-many-requests":
      return "Too many attempts — please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error — check your connection and try again.";
    default:
      return null;
  }
}

export { auth, onAuthStateChanged };
export type { User };
