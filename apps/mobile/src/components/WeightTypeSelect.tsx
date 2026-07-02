import { useWeightTypeOptions } from "@liftledger/api-client";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
}

export const WeightTypeSelect = ({ value, onSelect, label, error }: Props) => {
  const { allWeightTypeOptions, addWeightType } = useWeightTypeOptions();

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={allWeightTypeOptions}
      onSelect={onSelect}
      onAddCustom={addWeightType}
      canAddCustom
      placeholder="Enter or add a weight type..."
    />
  );
};
