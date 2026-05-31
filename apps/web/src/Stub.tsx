import { Link } from "react-router";

// Phase 3a placeholder for each route. Replaced with real pages in 3c. The
// nav list at the bottom is just so I can click around and verify routing
// without needing a real header yet.
export const Stub = ({ label }: { label: string }) => (
  <div style={{ padding: "8px" }}>
    <h2 style={{ marginBottom: 8 }}>{label}</h2>
    <p style={{ opacity: 0.7, fontSize: 14 }}>
      Phase 3a stub. Real content arrives in 3b/3c.
    </p>
    <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
      {[
        "/",
        "/dashboard",
        "/login",
        "/complete-day",
        "/edit-block",
        "/history",
        "/progress",
        "/profile",
        "/settings",
      ].map((to) => (
        <Link key={to} to={to} style={{ color: "#0096FF" }}>
          {to}
        </Link>
      ))}
    </nav>
  </div>
);
