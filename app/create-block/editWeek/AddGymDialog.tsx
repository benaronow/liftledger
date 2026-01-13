import { FaSave } from "react-icons/fa";
import { useUser } from "../../providers/UserProvider";
import { ActionDialog, DialogAction } from "../../components/ActionDialog";
import { LabeledInput } from "../../components/LabeledInput";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd?: (gym: string) => void;
}

export const AddGymDialog = ({ open, onClose, onAdd }: Props) => {
  const { curUser, updateUser } = useUser();
  const [gymName, setGymName] = useState<string>("");

  const handleAddGym = () => {
    if (curUser) {
      updateUser({
        ...curUser,
        gyms: [...(curUser?.gyms || []), gymName],
      });
    }
    onAdd?.(gymName);
    setGymName("");
    onClose();
  };

  const addGymActions: DialogAction[] = [
    {
      icon: <FaSave fontSize={28} />,
      onClick: handleAddGym,
      disabled: gymName === "" || curUser?.gyms?.includes(gymName),
      variant: "primary",
    },
  ];

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Add Gym"
      actions={addGymActions}
    >
      <LabeledInput
        label="Gym name"
        textValue={gymName}
        onChangeText={(e) => setGymName(e.target.value)}
      ></LabeledInput>
    </ActionDialog>
  );
};
