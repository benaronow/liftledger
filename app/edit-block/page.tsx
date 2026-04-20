import { EditBlock } from "./EditBlock";
import { EditBlockProvider } from "./EditBlockProvider";

const Page = () => {
  return (
    <EditBlockProvider>
      <EditBlock />
    </EditBlockProvider>
  );
};

export default Page;
