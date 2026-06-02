import { ExpoConfig, ConfigContext } from "expo/config";

// Reverse-DNS app id. react-native-auth0 hardcodes its native callback scheme
// to `{BUNDLE_ID}.auth0` (NativeWebAuthProvider), so the Auth0 dashboard's
// allowed callback/logout URLs must be:
//   app.liftledger.mobile.auth0://{AUTH0_DOMAIN}/ios/{BUNDLE_ID}/callback
//   app.liftledger.mobile.auth0://{AUTH0_DOMAIN}/android/{BUNDLE_ID}/callback
// We don't pass a customScheme to the plugin so its Info.plist registration
// defaults to the same `{BUNDLE_ID}.auth0` scheme the runtime uses.
const BUNDLE_ID = "app.liftledger.mobile";

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LiftLedger",
  slug: "liftledger",
  scheme: BUNDLE_ID,
  ios: {
    ...config.ios,
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
  },
  android: {
    ...config.android,
    package: BUNDLE_ID,
  },
  plugins: [
    [
      "react-native-auth0",
      {
        domain: AUTH0_DOMAIN,
      },
    ],
  ],
});
