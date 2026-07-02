import { useWeightTypeOptions } from "@liftledger/api-client";
import { SearchableSelect } from "../../components/SearchableSelect";
import { SectionCard } from "../../components/SectionCard";

export const DefaultWeightType = () => {
  const {
    allWeightTypeOptions,
    defaultWeightType,
    addWeightType,
    setDefaultWeightType,
  } = useWeightTypeOptions();

  return (
    <SectionCard title="Weight Type">
      <SearchableSelect
        label="Default weight type"
        value={defaultWeightType}
        options={allWeightTypeOptions}
        onSelect={setDefaultWeightType}
        onAddCustom={addWeightType}
        canAddCustom
        placeholder="Enter or add a weight type..."
      />
    </SectionCard>
  );
};
