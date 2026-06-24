import { WEIGHT_TYPES } from "@liftledger/shared";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
}

// The weight-type field, shared by CompleteDay's add/edit exercise form and the
// Program editor. A SearchableSelect over the fixed WEIGHT_TYPES (lbs/kgs) —
// no custom entry — so the control matches the other exercise selects.
export const WeightTypeSelect = ({ value, onSelect, label }: Props) => (
  <SearchableSelect
    label={label}
    value={value}
    options={WEIGHT_TYPES}
    onSelect={onSelect}
    placeholder="Enter weight type..."
  />
);
