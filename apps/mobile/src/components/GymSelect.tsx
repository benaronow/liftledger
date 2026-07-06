import { useGymOptions } from "@liftledger/api-client";
import { ReactNode } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
  canAddCustom?: boolean;
  prefix?: (item: string) => ReactNode;
  trailing?: (item: string) => ReactNode;
  renderTrigger?: (open: () => void) => ReactNode;
  dismissOnSelect?: boolean;
}

export const GymSelect = ({
  value,
  onSelect,
  label,
  error,
  canAddCustom,
  prefix,
  trailing,
  renderTrigger,
  dismissOnSelect,
}: Props) => {
  const { allGymOptions, addGym } = useGymOptions();

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={allGymOptions}
      onSelect={onSelect}
      onAddCustom={addGym}
      canAddCustom={canAddCustom}
      prefix={prefix}
      trailing={trailing}
      renderTrigger={renderTrigger}
      dismissOnSelect={dismissOnSelect}
      placeholder={canAddCustom ? "Search or add gym..." : "Search gym..."}
    />
  );
};
