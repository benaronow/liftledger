import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Welcome } from "./Welcome";
import { Dashboard } from "./Dashboard";
import { History } from "./History";
import { Progress } from "./Progress";
import { Profile } from "./Profile";
import { CompleteDay } from "./CompleteDay";
import { EditBlock } from "./EditBlock";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "welcome", element: <Welcome /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "complete-day", element: <CompleteDay /> },
      { path: "edit-block", element: <EditBlock /> },
      { path: "history", element: <History /> },
      { path: "progress", element: <Progress /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <div /> },
    ],
  },
]);
