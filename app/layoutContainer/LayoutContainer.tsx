"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./LayoutContainer.module.css";
import { RouteType } from "@/lib/types";
import { LogoSpinner } from "../components/LogoSpinner";
import { Timer } from "../components/Timer";

export const LayoutContainer = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
    router.prefetch(RouteType.Workout);
  }, [router]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && pathname !== RouteType.Login) {
      router.push(RouteType.Login);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Three render states:
  //   1. Bootstrapping / redirecting → spinner only.
  //   2. Unauthenticated on /login → render Login children, no chrome (Header
  //      / Footer / Timer all call useMe() in their bodies and would fire a
  //      tokenless fetch).
  //   3. Authenticated → full layout.
  if (!isAuthenticated) {
    return (
      <section className={styles.container}>
        <div className={styles.content}>
          {pathname === RouteType.Login && !isLoading ? children : <LogoSpinner />}
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
        {children}
      </div>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </section>
  );
};
