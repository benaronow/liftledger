"use client";

import { LoginProvider } from "./loginProvider";
import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";
import { createTheme, ThemeProvider } from "@mui/material";
import { InnerSizeProvider } from "./innerSizeProvider";
import { SessionData } from "@auth0/nextjs-auth0/types";

interface ProvidersProps {
  readonly children: ReactNode;
  session: SessionData | null;
}

export const Providers = ({ children, session }: ProvidersProps) => {
  const theme = createTheme();

  return (
    <StoreProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={theme}>
            <InnerSizeProvider>
              <LoginProvider session={session}>{children}</LoginProvider>
            </InnerSizeProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </NextAppDirEmotionCacheProvider>
    </StoreProvider>
  );
};
