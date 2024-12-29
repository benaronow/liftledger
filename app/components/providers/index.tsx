"use client"

import { LoginProvider } from "./loginContext";
import { ReactNode } from "react";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StoreProvider } from "@/app/StoreProvider";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

interface ProvidersProps {
  readonly children: ReactNode;
  session: SessionData | null;
}

export const Providers = ({ children, session }: ProvidersProps) => {
  return (
    <StoreProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LoginProvider session={session}>{children}</LoginProvider>
        </LocalizationProvider>
      </NextAppDirEmotionCacheProvider>
    </StoreProvider>
  );
};
