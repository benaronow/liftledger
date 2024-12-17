import type { Metadata } from "next";
import { App } from ".";

export default function IndexPage() {
  return <App/>;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
