"use client";

import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./LayoutContainer.module.css";
import { MUIProviders } from "./MUIProviders";
import { ScreenStateProvider } from "./ScreenStateProvider";
import { UserProvider } from "./UserProvider";
import { BlockProvider } from "./BlockProvider";
import { ExerciseOptionsProvider } from "./ExerciseOptionsProvider";
import { CompletedExercisesProvider } from "./CompletedExercisesProvider";
import { TimerProvider } from "./TimerProvider";
import { SessionData } from "@auth0/nextjs-auth0/types";

interface Props {
  session: SessionData | null;
}

export const LayoutContainer = ({
  children,
  session,
}: PropsWithChildren<Props>) => (
  <MUIProviders>
    <ScreenStateProvider>
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
    </ScreenStateProvider>
  </MUIProviders>
);
