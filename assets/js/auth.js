// ============================================================
// Authentication module
// ------------------------------------------------------------
// Exports:
//   - requireAuth()   : redirect to login if not authenticated,
//                       resolves with the Firebase user otherwise
//   - getCurrentUser(): returns the current user (or null)
//   - logout()        : signs the user out and redirects
//   - login(email,pw) : signs in, returns the user
// ============================================================

import { auth } from './firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Wait for Firebase to resolve the current auth state, then either
 * resolve with the user or redirect to login.html.
 *
 * Usage (in every protected page):
 *   const user = await requireAuth();
 */
export function requireAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        // Preserve intended destination so login can send them back
        const next = encodeURIComponent(location.pathname + location.search);
        location.replace(`index.html?next=${next}`);
        return; // do not resolve — page is navigating away
      }
      resolve(user);
    });
  });
}

/**
 * Returns the current user synchronously-ish (null if signed out).
 * Resolves once Firebase has restored the session.
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/**
 * Sign in with email/password.
 * Throws on failure (caller should catch and show the error).
 */
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Sign out and go to login page.
 */
export async function logout() {
  await signOut(auth);
  location.replace('index.html');
}

/**
 * Optional: if the URL contains ?next=..., return it (safe, same-origin only).
 */
export function getNextUrl(fallback = 'dashboard.html') {
  const params = new URLSearchParams(location.search);
  const next = params.get('next');
  if (!next) return fallback;
  // Prevent open redirect: only allow same-origin paths
  try {
    const url = new URL(next, location.origin);
    if (url.origin !== location.origin) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
