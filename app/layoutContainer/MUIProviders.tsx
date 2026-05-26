"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

export const MUIProviders = ({ children }: { children: ReactNode }) => (
  <AppRouterCacheProvider options={{ key: "css" }}>
    <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
  </AppRouterCacheProvider>
);
