import { Progress } from "./Progress";
import { ProgressProvider } from "./ProgressProvider";

const Page = () => (
  <ProgressProvider>
    <Progress />
  </ProgressProvider>
);

export default Page;
