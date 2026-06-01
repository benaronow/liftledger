import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import styles from "./Layout.module.css";
import { LogoSpinner } from "@/components/LogoSpinner";
import { Timer } from "@/components/Timer";
import { useAuthentication } from "./useAuthentication";

export const Layout = () => {
  const { isAuthenticating } = useAuthentication();

  if (isAuthenticating) {
    return (
      <section className={styles.container}>
        <div className={styles.content}>
          <LogoSpinner />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <Header />
      </header>
      <div className={styles.content}>
        <Timer />
        <Outlet />
      </div>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </section>
  );
};
