import type { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { LayoutContainer } from "./layoutContainer";
import { auth0 } from "@/lib/auth0";

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
        <style
          dangerouslySetInnerHTML={{
            __html: `html, body { background-color: #131314 !important; }`,
          }}
        />
      </head>
      <body>
        <LayoutContainer session={session}>{children}</LayoutContainer>
      </body>
    </html>
  );
};

export default RootLayout;
