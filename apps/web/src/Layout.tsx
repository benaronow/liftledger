import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";

const LOGIN_PATH = "/login";

// Phase 3a shape: ports only the auth-gate behavior from the Next
// LayoutContainer. Header / Footer / Timer come in 3c — for now the layout
// just provides the dark-background wrapper and the spinner-while-redirecting
// state. Mounting Header/Footer/Timer here too early would fire useMe()
// before auth has settled.
export const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && pathname !== LOGIN_PATH) {
      navigate(LOGIN_PATH);
    }
  }, [isAuthenticated, isLoading, pathname, navigate]);

  if (!isAuthenticated) {
    return (
      <Shell>
        {pathname === LOGIN_PATH && !isLoading ? <Outlet /> : <Spinner />}
      </Shell>
    );
  }

  return (
    <Shell>
      <Outlet />
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section
    style={{
      minHeight: "100dvh",
      background: "#3c3c3e",
      color: "white",
      padding: "16px",
    }}
  >
    {children}
  </section>
);

const Spinner = () => (
  <div style={{ textAlign: "center", marginTop: "40dvh" }}>Loading…</div>
);
