import { CompleteDay } from "./CompleteDay";
import { CompleteDayProvider } from "./CompleteDayProvider";

const Page = () => {
  return (
    <CompleteDayProvider>
      <CompleteDay />
    </CompleteDayProvider>
  );
};

export default Page;
