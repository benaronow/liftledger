"use client";

import { PropsWithChildren, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./LayoutContainer.module.css";
import { UserProvider } from "./UserProvider";
import { BlockProvider } from "./BlockProvider";
import { ExerciseOptionsProvider } from "./ExerciseOptionsProvider";
import { CompletedExercisesProvider } from "./CompletedExercisesProvider";
import { TimerProvider } from "./TimerProvider";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { useRouter } from "next/navigation";
import { RouteType } from "@/lib/types";

interface Props {
  session: SessionData | null;
}

export const LayoutContainer = ({
  children,
  session,
}: PropsWithChildren<Props>) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
    router.prefetch(RouteType.Workout);
  }, [router]);

  return (
    <UserProvider session={session}>
      <BlockProvider>
        <ExerciseOptionsProvider>
          <CompletedExercisesProvider>
            <TimerProvider>
              <section className={styles.container}>
                <header className={styles.header}>
                  <Header />
                </header>
                <div className={styles.content}>{children}</div>
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
