import { createBrowserRouter } from "react-router";
import { Layout } from "./layout/Layout";
import { Login } from "./login/Login";
import { IndexPage } from "./home/IndexPage";
import { Dashboard } from "./dashboard/Dashboard";
import { History } from "./history/History";
import { Progress } from "./progress/Progress";
import { ProgressProvider } from "./progress/ProgressProvider";
import { Profile } from "./profile/Profile";
import { CompleteDay } from "./complete-day/CompleteDay";
import { CompleteDayProvider } from "./complete-day/CompleteDayProvider";
import { EditBlockRoute } from "./edit-block/EditBlockRoute";

// Single source of truth for routes — keep this file thin and declaration-only
// so a future swap to TanStack Router stays surgical.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <IndexPage /> },
      { path: "login", element: <Login /> },
      { path: "dashboard", element: <Dashboard /> },
      {
        path: "complete-day",
        element: (
          <CompleteDayProvider>
            <CompleteDay />
          </CompleteDayProvider>
        ),
      },
      { path: "edit-block", element: <EditBlockRoute /> },
      { path: "history", element: <History /> },
      {
        path: "progress",
        element: (
          <ProgressProvider>
            <Progress />
          </ProgressProvider>
        ),
      },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <div /> },
    ],
  },
]);
