import { WEIGHT_TYPES } from "@liftledger/shared";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
}

export const WeightTypeSelect = ({ value, onSelect, label, error }: Props) => (
  <SearchableSelect
    label={label}
    error={error}
    value={value}
    options={WEIGHT_TYPES}
    onSelect={onSelect}
    placeholder="Enter weight type..."
  />
);
