// Expo statically inlines process.env.EXPO_PUBLIC_* at build time, so these
// must be referenced as literal member expressions (no dynamic indexing).
export const env = {
  auth0Domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? "",
  auth0ClientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? "",
  auth0Audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? "",
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
};
