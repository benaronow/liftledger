import { useUnitOptions } from "@liftledger/api-client";
import { SearchableSelect } from "../../components/SearchableSelect";
import { SectionCard } from "../../components/SectionCard";

export const DefaultUnit = () => {
  const { allUnitOptions, defaultUnit, addUnit, setDefaultUnit } =
    useUnitOptions();

  return (
    <SectionCard title="Unit">
      <SearchableSelect
        label="Default unit"
        value={defaultUnit}
        options={allUnitOptions}
        onSelect={setDefaultUnit}
        onAddCustom={addUnit}
        canAddCustom
        placeholder="Enter or add a unit..."
      />
    </SectionCard>
  );
};
