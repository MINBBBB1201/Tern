"use client";

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation. Importing
 * `Link`/`useRouter` from here instead of next/* is what keeps the locale
 * prefix on internal navigation — a bare next/link href="/about" would drop
 * a ko user back onto the English page.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
