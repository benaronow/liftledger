import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Stub } from "./Stub";
import { Login } from "./login/Login";

// Single source of truth for routes — keep this file thin and declaration-only
// so a future swap to TanStack Router stays surgical.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Stub label="home (will redirect)" /> },
      { path: "login", element: <Login /> },
      { path: "dashboard", element: <Stub label="dashboard" /> },
      { path: "complete-day", element: <Stub label="complete-day" /> },
      { path: "edit-block", element: <Stub label="edit-block" /> },
      { path: "history", element: <Stub label="history" /> },
      { path: "progress", element: <Stub label="progress" /> },
      { path: "profile", element: <Stub label="profile" /> },
      { path: "settings", element: <Stub label="settings" /> },
    ],
  },
]);
