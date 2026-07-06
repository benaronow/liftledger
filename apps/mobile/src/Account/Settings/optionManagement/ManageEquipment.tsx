import { useExerciseOptions } from "@liftledger/api-client";
import { EquipmentSelect } from "../../../components/EquipmentSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageEquipment = () => {
  const {
    allEquipmentOptions: allExerciseEquipmentOptions,
    deleteEquipment: deleteExerciseEquipment,
  } = useExerciseOptions();

  return (
    <ManageOptions
      optionType="equipment"
      buttonLabel="Edit equipment"
      singular="equipment"
      fieldLabel="Equipment"
      options={allExerciseEquipmentOptions}
      onDelete={deleteExerciseEquipment}
    >
      {(props) => <EquipmentSelect {...props} canAddCustom />}
    </ManageOptions>
  );
};
