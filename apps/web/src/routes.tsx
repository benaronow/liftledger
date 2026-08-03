import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./Layout";
import { Landing } from "./Landing";
import { Privacy } from "./Privacy";
import { Support } from "./Support";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Landing /> },
      { path: "privacy", element: <Privacy /> },
      { path: "support", element: <Support /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
