import type { Metadata } from "next";
import { LiftLedger } from "./components/liftLedger";

const IndexPage = () => {
  return <LiftLedger />;
};

export const metadata: Metadata = {
  title: "LiftLedger",
};

export default IndexPage;
