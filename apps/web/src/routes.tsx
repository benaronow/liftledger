import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Welcome } from "./Welcome";
import { Dashboard } from "./Dashboard";
import { History } from "./History";
import { Progress } from "./Progress";
import { Profile } from "./Profile";
import { CompleteSession } from "./CompleteSession";
import { EditProgram } from "./EditProgram";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "welcome", element: <Welcome /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "complete-session", element: <CompleteSession /> },
      { path: "edit-program", element: <EditProgram /> },
      { path: "history", element: <History /> },
      { path: "progress", element: <Progress /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <div /> },
    ],
  },
]);
