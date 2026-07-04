import { useUnitOptions } from "@liftledger/api-client";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
}

export const UnitSelect = ({ value, onSelect, label, error }: Props) => {
  const { allUnitOptions, addUnit } = useUnitOptions();

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={allUnitOptions}
      onSelect={onSelect}
      onAddCustom={addUnit}
      canAddCustom
      placeholder="Enter or add a unit..."
    />
  );
};
