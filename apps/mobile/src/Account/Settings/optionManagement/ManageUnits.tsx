import { useUnitOptions } from "@liftledger/api-client";
import { UnitSelect } from "../../../components/UnitSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageUnits = () => {
  const { allUnitOptions, deleteUnit } = useUnitOptions();

  return (
    <ManageOptions
      optionType="unit"
      buttonLabel="Units"
      singular="unit"
      fieldLabel="Unit"
      options={allUnitOptions}
      onDelete={deleteUnit}
    >
      {(props) => <UnitSelect {...props} />}
    </ManageOptions>
  );
};
