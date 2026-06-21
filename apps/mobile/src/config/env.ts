// Expo statically inlines process.env.EXPO_PUBLIC_* at build time, so these
// must be referenced as literal member expressions (no dynamic indexing).
export const env = {
  auth0Domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? "",
  auth0ClientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? "",
  auth0Audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? "",
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  // E2E-only: credentials for the dedicated regression-test user. Set in
  // .env.local (never committed) so the dev-build Welcome screen can expose a
  // password-realm sign-in shortcut for Maestro. Absent in release builds.
  e2eEmail: process.env.EXPO_PUBLIC_E2E_EMAIL ?? "",
  e2ePassword: process.env.EXPO_PUBLIC_E2E_PASSWORD ?? "",
};
