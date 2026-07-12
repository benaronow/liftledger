import { useGymOptions, useRemoveGym } from "@liftledger/api-client";
import { GymSelect } from "../../../components/GymSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageGyms = () => {
  const { data: options = [] } = useGymOptions();
  const { send: removeGym } = useRemoveGym();

  const remove = async (value: string) => {
    await removeGym(value);
  };

  return (
    <ManageOptions
      optionType="gym"
      buttonLabel="Gyms"
      singular="gym"
      fieldLabel="Gym"
      options={options}
      onDelete={remove}
    >
      {(props) => <GymSelect {...props} canAddCustom />}
    </ManageOptions>
  );
};
