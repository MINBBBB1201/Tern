import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<void> {
  await signInWithRedirect(auth, provider);
}

export async function handleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result ? result.user : null;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getUser(): User | null {
  return auth.currentUser;
}

export { auth, onAuthStateChanged };
export type { User };
