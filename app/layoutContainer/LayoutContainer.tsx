"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./LayoutContainer.module.css";
import { UserProvider } from "./UserProvider";
import { BlockProvider } from "./BlockProvider";
import { ExerciseOptionsProvider } from "./ExerciseOptionsProvider";
import { CompletedExercisesProvider } from "./CompletedExercisesProvider";
import { TimerProvider } from "./TimerProvider";
import { RouteType } from "@/lib/types";
import { LogoSpinner } from "../components/LogoSpinner";

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

  // Show a spinner during Auth0 bootstrap, and while we're redirecting an
  // unauthenticated visit toward /login. Login page itself renders normally.
  const showSpinner =
    isLoading || (!isAuthenticated && pathname !== RouteType.Login);

  return (
    <UserProvider>
      <BlockProvider>
        <ExerciseOptionsProvider>
          <CompletedExercisesProvider>
            <TimerProvider>
              <section className={styles.container}>
                <header className={styles.header}>
                  <Header />
                </header>
                <div className={styles.content}>
                  {showSpinner ? <LogoSpinner /> : children}
                </div>
                <footer className={styles.footer}>
                  <Footer />
                </footer>
              </section>
            </TimerProvider>
          </CompletedExercisesProvider>
        </ExerciseOptionsProvider>
      </BlockProvider>
    </UserProvider>
  );
};
