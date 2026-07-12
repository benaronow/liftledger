import {
  useEquipmentOptions,
  useRemoveEquipment,
} from "@liftledger/api-client";
import { EquipmentSelect } from "../../../components/EquipmentSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageEquipment = () => {
  const { data: allExerciseEquipmentOptions = [] } = useEquipmentOptions();
  const { send: removeEquipment } = useRemoveEquipment();

  const deleteExerciseEquipment = async (value: string) => {
    await removeEquipment(value);
  };

  return (
    <ManageOptions
      optionType="equipment"
      buttonLabel="Equipment"
      singular="equipment"
      fieldLabel="Equipment"
      options={allExerciseEquipmentOptions}
      onDelete={deleteExerciseEquipment}
    >
      {(props) => <EquipmentSelect {...props} canAddCustom />}
    </ManageOptions>
  );
};
