import { useGymOptions } from "@liftledger/api-client";
import { GymSelect } from "../../../components/GymSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageGyms = () => {
  const { allGymOptions, deleteGym } = useGymOptions();

  return (
    <ManageOptions
      optionType="gym"
      buttonLabel="Gyms"
      singular="gym"
      fieldLabel="Gym"
      options={allGymOptions}
      onDelete={deleteGym}
    >
      {(props) => <GymSelect {...props} canAddCustom />}
    </ManageOptions>
  );
};
