import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./Layout.module.css";
import { RouteType } from "@/lib/types";
import { LogoSpinner } from "@/components/LogoSpinner";
import { Timer } from "@/components/Timer";

export const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && pathname !== RouteType.Login) {
      navigate(RouteType.Login);
    }
  }, [isAuthenticated, isLoading, pathname, navigate]);

  // Three render states (ported from Next LayoutContainer):
  //   1. Bootstrapping / redirecting → spinner only.
  //   2. Unauthenticated on /login → render Login (route's <Outlet />), no
  //      chrome — Header / Footer / Timer all call useMe() in their bodies and
  //      would fire a tokenless fetch before silent auth completes.
  //   3. Authenticated → full layout.
  if (!isAuthenticated) {
    return (
      <section className={styles.container}>
        <div className={styles.content}>
          {pathname === RouteType.Login && !isLoading ? (
            <Outlet />
          ) : (
            <LogoSpinner />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <Header />
      </header>
      <div className={styles.content}>
        <Timer />
        <Outlet />
      </div>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </section>
  );
};
