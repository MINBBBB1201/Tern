"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "../../i18n/locales";

export async function setLocale(nextLocale: string) {
  if (!isLocale(nextLocale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, nextLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // Re-render server components (layout down) with the new locale.
  revalidatePath("/", "layout");
}
