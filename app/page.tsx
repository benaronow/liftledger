import type { Metadata } from "next";
import { FitnessLog } from "./components/fitnessLog";

export default function IndexPage() {
  return <FitnessLog />;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
