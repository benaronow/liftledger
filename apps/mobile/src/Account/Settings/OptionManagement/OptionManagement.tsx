import { View } from "react-native";
import { SectionCard } from "../../../components/SectionCard";
import { SPACING } from "../../../theme";
import { ManageExerciseNames } from "./ManageExerciseNames";
import { ManageEquipment } from "./ManageEquipment";
import { ManageGyms } from "./ManageGyms";
import { ManageUnits } from "./ManageUnits";
import { UnitSelect } from "../../../components/UnitSelect";
import { useDefaultUnit, useSetDefaultUnit } from "@liftledger/api-client";

export const OptionManagement = () => {
  const defaultUnit = useDefaultUnit();
  const { send: setDefaultUnit } = useSetDefaultUnit();

  const handleSetDefaultUnit = (value: string) => {
    return setDefaultUnit({ defaultUnit: value });
  };

  return (
    <SectionCard title="Exercise Options">
      <View style={{ gap: SPACING.md }}>
        <UnitSelect
          label="Default unit"
          value={defaultUnit}
          onSelect={handleSetDefaultUnit}
        />
        <View style={{ flexDirection: "row", gap: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <ManageExerciseNames />
          </View>
          <View style={{ flex: 1 }}>
            <ManageEquipment />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <ManageGyms />
          </View>
          <View style={{ flex: 1 }}>
            <ManageUnits />
          </View>
        </View>
      </View>
    </SectionCard>
  );
};
