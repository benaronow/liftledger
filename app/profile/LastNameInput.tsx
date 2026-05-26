import { Spinner } from "react-bootstrap";
import { ActionButton } from "../components/ActionButton";
import { LabeledTextInput } from "../components/inputs";
import { FaSave } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../layoutContainer/UserProvider";

export const LastNameInput = () => {
  const { curUser, updateUser } = useUser();
  const [lastName, setLastName] = useState("");
  const [savingLastName, setSavingLastName] = useState(false);

  useEffect(() => {
    if (curUser) {
      setLastName(curUser.lastName ?? "");
    }
  }, [curUser?._id]);

  const lastNameEdited = useMemo(
    () => lastName !== (curUser?.lastName ?? ""),
    [lastName, curUser?.lastName],
  );

  const handleSaveLastName = useCallback(async () => {
    if (!curUser) return;
    setSavingLastName(true);
    await updateUser({ ...curUser, lastName });
    setSavingLastName(false);
  }, [curUser, lastName, updateUser]);

  return (
    <LabeledTextInput
      label="Last Name"
      placeholder="Enter last name..."
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      renderEnd={() => (
        <ActionButton
          variant="primary"
          height={35}
          width={35}
          roundedSide="end"
          disabled={!lastNameEdited || lastName.trim() === ""}
          icon={
            savingLastName ? (
              <Spinner animation="border" variant="light" size="sm" />
            ) : (
              <FaSave size={14} />
            )
          }
          onClick={handleSaveLastName}
        />
      )}
    />
  );
};
