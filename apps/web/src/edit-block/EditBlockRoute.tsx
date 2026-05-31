import { useSearchParams } from "react-router";
import { EditBlock } from "./EditBlock";
import { EditBlockProvider } from "./EditBlockProvider";

// Route wrapper. Reads the `duplicateFrom` query param and forces a fresh
// EditBlockProvider mount per value (via React key), so seeding re-runs when
// the user navigates to a different duplicate URL.
export const EditBlockRoute = () => {
  const [searchParams] = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");

  return (
    <EditBlockProvider
      key={duplicateFromId ?? "default"}
      duplicateFromId={duplicateFromId}
    >
      <EditBlock />
    </EditBlockProvider>
  );
};
