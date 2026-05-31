"use client";

import { useSearchParams } from "next/navigation";
import { EditBlock } from "./EditBlock";
import { EditBlockProvider } from "./EditBlockProvider";

const Page = () => {
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");

  return (
    <EditBlockProvider
      // key forces a fresh mount when the user navigates to a different
      // duplicate URL — the seeding effect re-runs with the new source block.
      key={duplicateFromId ?? "default"}
      duplicateFromId={duplicateFromId}
    >
      <EditBlock />
    </EditBlockProvider>
  );
};

export default Page;
