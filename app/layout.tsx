import type { ReactNode } from "react";
import "./styles/globals.css";
import styles from "./styles/layout.module.css";
import { Providers } from "./providers";
import { auth0 } from "@/app/auth0";
import { Header } from "./components/header";
import { MessageModal } from "./components/messageModal";
import { Overlay } from "./components/overlay";
import { Footer } from "./components/footer";

interface Props {
  readonly children: ReactNode;
}

const RootLayout = async ({ children }: Props) => {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <head>
        <title>LiftLedger</title>
        <meta name="title" content="LiftLedger"></meta>
        <meta
          name="description"
          content="An app for tracking resistance-training progression."
        ></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#131314" />
        <meta httpEquiv="ScreenOrientation" content="autoRotate:disabled" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          sizes="16x16"
          href="/images/icon1.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="32x32"
          href="/images/icon2.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="48x48"
          href="/images/icon3.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="96x96"
          href="/images/icon4.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="144x144"
          href="/images/icon5.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-icon.png"
          type="image/png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=League+Spartan:wght@100..900&family=Mina:wght@400;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers session={session}>
          <section className={styles.container}>
            <header className={styles.header}>
              <Header />
            </header>

            <main className={styles.main}>
              <>
                <Overlay />
                {children}
                <MessageModal />
              </>
            </main>
            <footer className={styles.footer}>
              <Footer />
            </footer>
          </section>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
