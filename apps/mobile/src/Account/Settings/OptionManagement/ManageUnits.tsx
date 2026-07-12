import { useRemoveUnit, useUnitOptions } from "@liftledger/api-client";
import { UnitSelect } from "../../../components/UnitSelect";
import { ManageOptions } from "./ManageOptions";

export const ManageUnits = () => {
  const { data: options = [] } = useUnitOptions();
  const { send: removeUnit } = useRemoveUnit();

  const remove = async (value: string) => {
    await removeUnit(value);
  };

  return (
    <ManageOptions
      optionType="unit"
      buttonLabel="Units"
      singular="unit"
      fieldLabel="Unit"
      options={options}
      onDelete={remove}
    >
      {(props) => <UnitSelect {...props} />}
    </ManageOptions>
  );
};
