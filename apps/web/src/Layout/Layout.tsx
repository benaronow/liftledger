import { Outlet } from "react-router";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export const Layout = () => (
  <>
    <SiteHeader />
    <main style={{ flex: 1 }}>
      <Outlet />
    </main>
    <SiteFooter />
  </>
);
