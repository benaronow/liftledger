import { View } from "react-native";
import { SectionCard } from "../../../components/SectionCard";
import { SPACING } from "../../../theme";
import { ManageExerciseNames } from "./ManageExerciseNames";
import { ManageEquipment } from "./ManageEquipment";
import { ManageGyms } from "./ManageGyms";
import { ManageUnits } from "./ManageUnits";
import { UnitSelect } from "../../../components/UnitSelect";
import { useUnitOptions } from "@liftledger/api-client";

export const OptionManagement = () => {
  const { defaultUnit, setDefaultUnit } = useUnitOptions();

  return (
    <SectionCard title="Exercise Options">
      <View style={{ gap: SPACING.md }}>
        <UnitSelect
          label="Default unit"
          value={defaultUnit}
          onSelect={setDefaultUnit}
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
