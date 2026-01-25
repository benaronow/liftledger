"use client";

import { UserProvider } from "./UserProvider";
import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { createTheme, ThemeProvider } from "@mui/material";
import { ScreenStateProvider } from "./ScreenStateProvider";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { BlockProvider } from "./BlockProvider";
import { TimerProvider } from "./TimerProvider";
import { CompletedExercisesProvider } from "./CompletedExercisesProvider";

interface ProvidersProps {
  readonly children: ReactNode;
  session: SessionData | null;
}

export const Providers = ({ children, session }: ProvidersProps) => {
  const theme = createTheme();

  return (
    <AppRouterCacheProvider options={{ key: "css" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <ScreenStateProvider>
            <UserProvider session={session}>
              <BlockProvider>
                <CompletedExercisesProvider>
                  <TimerProvider>{children}</TimerProvider>
                </CompletedExercisesProvider>
              </BlockProvider>
            </UserProvider>
          </ScreenStateProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </AppRouterCacheProvider>
  );
};
