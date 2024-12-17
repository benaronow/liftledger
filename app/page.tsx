import type { Metadata } from "next";
import { FitnessLog } from "./components/fitnessLog/FitnessLog";

export default function IndexPage() {
  return <FitnessLog />;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
