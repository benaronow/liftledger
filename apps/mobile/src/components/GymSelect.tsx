import { useAddGym, useGymOptions } from "@liftledger/api-client";
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
  const { data: options = [] } = useGymOptions();
  const { send: addGym } = useAddGym();

  const handleAdd = async (value: string) => {
    await addGym({ value });
  };

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={options}
      onSelect={onSelect}
      onAddCustom={handleAdd}
      canAddCustom={canAddCustom}
      prefix={prefix}
      trailing={trailing}
      renderTrigger={renderTrigger}
      dismissOnSelect={dismissOnSelect}
      placeholder={canAddCustom ? "Search or add gym..." : "Search gym..."}
    />
  );
};
