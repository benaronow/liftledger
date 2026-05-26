import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../layoutContainer/UserProvider";
import { LabeledTextInput } from "../components/inputs";
import { ActionButton } from "../components/ActionButton";
import { Spinner } from "react-bootstrap";
import { FaSave } from "react-icons/fa";

export const FirstNameInput = () => {
  const { curUser, updateUser } = useUser();
  const [firstName, setFirstName] = useState("");
  const [savingFirstName, setSavingFirstName] = useState(false);

  useEffect(() => {
    if (curUser) {
      setFirstName(curUser.firstName ?? "");
    }
  }, [curUser?._id]);

  const firstNameEdited = useMemo(
    () => firstName !== (curUser?.firstName ?? ""),
    [firstName, curUser?.firstName],
  );

  const handleSaveFirstName = useCallback(async () => {
    if (!curUser) return;
    setSavingFirstName(true);
    await updateUser({ ...curUser, firstName });
    setSavingFirstName(false);
  }, [curUser, firstName, updateUser]);

  return (
    <LabeledTextInput
      label="First Name"
      placeholder="Enter first name..."
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      renderEnd={() => (
        <ActionButton
          variant="primary"
          height={35}
          width={35}
          roundedSide="end"
          disabled={!firstNameEdited || firstName.trim() === ""}
          icon={
            savingFirstName ? (
              <Spinner animation="border" variant="light" size="sm" />
            ) : (
              <FaSave size={14} />
            )
          }
          onClick={handleSaveFirstName}
        />
      )}
    />
  );
};
