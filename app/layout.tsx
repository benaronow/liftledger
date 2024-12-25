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
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#a3248d" />
          <link rel="icon" href="img/favicon.ico" type="image/x-icon" />
          <link
            rel="shortcut icon"
            href="img/favicon.ico"
            type="image/x-icon"
          />
          <link
            rel="icon"
            sizes="16x16"
            href="img/favicon-16.png"
            type="image/png"
          />
          <link
            rel="icon"
            sizes="32x32"
            href="img/favicon-32.png"
            type="image/png"
          />
          <link
            rel="icon"
            sizes="48x48"
            href="img/favicon-48.png"
            type="image/png"
          />
          <link
            rel="icon"
            sizes="96x96"
            href="img/favicon-96.png"
            type="image/png"
          />
          <link
            rel="icon"
            sizes="144x144"
            href="img/favicon-144.png"
            type="image/png"
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
