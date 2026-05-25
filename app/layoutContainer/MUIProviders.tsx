"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

export const MUIProviders = ({ children }: { children: ReactNode }) => (
  <AppRouterCacheProvider options={{ key: "css" }}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
    </LocalizationProvider>
  </AppRouterCacheProvider>
);
