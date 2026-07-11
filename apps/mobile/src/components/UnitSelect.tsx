import { useAddUnit, useUnitOptions } from "@liftledger/api-client";
import { ReactNode } from "react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
  error?: string;
  prefix?: (item: string) => ReactNode;
  trailing?: (item: string) => ReactNode;
  renderTrigger?: (open: () => void) => ReactNode;
  dismissOnSelect?: boolean;
}

export const UnitSelect = ({
  value,
  onSelect,
  label,
  error,
  prefix,
  trailing,
  renderTrigger,
  dismissOnSelect,
}: Props) => {
  const { data: options = [] } = useUnitOptions();
  const { send: addUnit } = useAddUnit();

  const handleAdd = async (value: string) => {
    await addUnit({ value });
  };

  return (
    <SearchableSelect
      label={label}
      error={error}
      value={value}
      options={options}
      onSelect={onSelect}
      onAddCustom={handleAdd}
      canAddCustom
      prefix={prefix}
      trailing={trailing}
      renderTrigger={renderTrigger}
      dismissOnSelect={dismissOnSelect}
      placeholder="Search or add unit..."
    />
  );
};
