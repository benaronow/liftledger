const required = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};

const optional = (name: string, fallback = ""): string =>
  process.env[name] ?? fallback;

// Lazy-evaluated env so tests can build the app without setting production-only
// vars (Auth0 audience/issuer). The `build()` factory only reads them when
// not in testAuth mode.
export const env = {
  get PORT() {
    return Number(optional("PORT", "4000"));
  },
  get MONGODB_URI() {
    return required("MONGODB_URI");
  },
  get AUTH0_AUDIENCE() {
    return required("AUTH0_AUDIENCE");
  },
  get AUTH0_ISSUER_BASE_URL() {
    return required("AUTH0_ISSUER_BASE_URL");
  },
  get AUTH0_TENANT_DOMAIN() {
    return optional("AUTH0_TENANT_DOMAIN");
  },
  get AUTH0_MGMT_CLIENT_ID() {
    return optional("AUTH0_MGMT_CLIENT_ID");
  },
  get AUTH0_MGMT_CLIENT_SECRET() {
    return optional("AUTH0_MGMT_CLIENT_SECRET");
  },
  get AUTH0_DOMAIN() {
    return optional("AUTH0_DOMAIN");
  },
  get AUTH0_CLIENT_ID() {
    return optional("AUTH0_CLIENT_ID");
  },
  // Shared secret used by the Auth0 PreUserRegistration action to call the
  // internal username-availability lookup. Optional so tests/local runs work
  // without it; the internal route returns 503 when it's unset.
  get INTERNAL_API_SECRET() {
    return optional("INTERNAL_API_SECRET");
  },
  get CORS_ORIGINS(): string[] {
    return optional(
      "CORS_ORIGINS",
      "https://localhost:3000,http://localhost:3000",
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
  get SSL_CRT_FILE() {
    return optional("SSL_CRT_FILE");
  },
  get SSL_KEY_FILE() {
    return optional("SSL_KEY_FILE");
  },
};
