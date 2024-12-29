import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";

import "./styles/globals.css";
import styles from "./styles/layout.module.css";
import { Header } from "./components/header";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <html lang="en">
          <head>
            <meta
              name="description"
              content="An app for tracking resistance-training progression."
            ></meta>
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1"
            />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="theme-color" content="#a3248d" />
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
              href="https://fonts.googleapis.com/css2?family=Alkatra:wght@400..700&family=Anta&family=Audiowide&family=Baumans&family=Belanosima:wght@400;600;700&family=Bowlby+One+SC&family=Contrail+One&family=Edu+AU+VIC+WA+NT+Guides:wght@400..700&family=Fugaz+One&family=Gabarito:wght@400..900&family=Goldman:wght@400;700&family=Iceberg&family=Jockey+One&family=Keania+One&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Mina:wght@400;700&family=Odibee+Sans&family=Racing+Sans+One&family=Shrikhand&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=ZCOOL+QingKe+HuangYou&family=Zen+Dots&display=swap"
              rel="stylesheet"
            ></link>
          </head>
          <body>
            <section className={styles.container}>
              <header>
                <Header />
              </header>

              <main className={styles.main}>{children}</main>

              <footer className={styles.footer}></footer>
            </section>
          </body>
        </html>
      </NextAppDirEmotionCacheProvider>
    </StoreProvider>
  );
}
