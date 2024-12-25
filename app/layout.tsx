import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";

import "./styles/globals.css";
import styles from "./styles/layout.module.css";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en">
        <head>
          <meta
            name="description"
            content="An app for tracking resistance-training progression."
          ></meta>
          <meta name="apple-mobile-web-app-title" content="LiftLedger" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" sizes="96x96" href="icon/icon-96.png" />
          <link
            rel="apple-touch-icon"
            sizes="196x196"
            href="icon/icon-196.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="icon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="icon/favicon-16x16.png"
          />
          <link rel="manifest" href="manifest.json" />
        </head>
        <body>
          <section className={styles.container}>
            <header className={styles.header}></header>

            <main className={styles.main}>{children}</main>

            <footer className={styles.footer}></footer>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}
