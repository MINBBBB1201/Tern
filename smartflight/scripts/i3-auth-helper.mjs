// I3 test-account helper: create / verify-signin / delete a single throwaway
// email-password account on the live Firebase project so the signed-in nav and
// the booking gate can be screenshotted and the end-to-end loop tested. The
// account is deleted at the end of I3 (net-zero). Reads config from .env.local.
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import fs from "node:fs";
import path from "node:path";

const envText = fs.readFileSync(path.resolve(".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);

export const TEST_EMAIL = "i3-audit-tern@example.com";
export const TEST_PASSWORD = "Tern-i3-Audit-9271";
export const TEST_NAME = "Min (Test)";

const cmd = process.argv[2];

try {
  if (cmd === "create") {
    try {
      const cred = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      await updateProfile(cred.user, { displayName: TEST_NAME });
      console.log(`created uid=${cred.user.uid} email=${cred.user.email} name=${cred.user.displayName} domain=${env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        const cred = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log(`already-exists, signed in ok uid=${cred.user.uid} name=${cred.user.displayName}`);
      } else throw e;
    }
  } else if (cmd === "verify") {
    const cred = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log(`SIGN-IN OK uid=${cred.user.uid} email=${cred.user.email} name=${cred.user.displayName} authDomain=${env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
  } else if (cmd === "delete") {
    const cred = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    await deleteUser(cred.user);
    console.log(`deleted ${TEST_EMAIL}`);
  } else {
    console.log("usage: node scripts/i3-auth-helper.mjs create|verify|delete");
  }
} catch (e) {
  console.error(`ERROR code=${e.code || ""} msg=${e.message}`);
  process.exit(1);
}
process.exit(0);
