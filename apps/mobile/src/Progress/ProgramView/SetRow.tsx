import { Set, getUnitLabel } from "@liftledger/shared";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import { AppTextInput, NumberInput } from "../../components/inputs";
import { FONT, SPACING } from "../../theme";

interface Props {
  set: Set;
  label: string;
  unit: string;
  onChange: (set: Set) => void;
}

export const SetRow = ({ set, label, unit, onChange }: Props) => {
  const { colors } = useTheme();
  const dropSets = set.dropSets ?? [];
  const unitLabel = getUnitLabel(unit);

  const update = (partial: Partial<Set>) => onChange({ ...set, ...partial });

  const updateDrop = (
    idx: number,
    field: "weight" | "reps",
    value: number | null,
  ) =>
    update({
      dropSets: dropSets.toSpliced(idx, 1, {
        ...dropSets[idx],
        [field]: value,
      }),
    });

  return (
    <View style={{ gap: SPACING.sm }}>
      <Text
        style={{
          fontSize: FONT.xs,
          fontWeight: "700",
          color: colors.onSurfaceVariant,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", gap: SPACING.sm }}>
        <NumberInput
          style={{ flex: 1 }}
          label={unitLabel}
          value={set.weight}
          decimal
          onChangeValue={(weight) => update({ weight })}
        />
        <NumberInput
          style={{ flex: 1 }}
          label="Reps"
          value={set.reps}
          onChangeValue={(reps) => update({ reps })}
        />
      </View>
      <AppTextInput
        label="Note"
        value={set.note}
        onChangeText={(note) => update({ note })}
      />
      {dropSets.map((drop, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
          }}
        >
          <NumberInput
            style={{ flex: 1 }}
            label={`Drop ${unitLabel.toLowerCase()}`}
            value={drop.weight}
            decimal
            onChangeValue={(weight) => updateDrop(idx, "weight", weight)}
          />
          <NumberInput
            style={{ flex: 1 }}
            label="Drop reps"
            value={drop.reps}
            onChangeValue={(reps) => updateDrop(idx, "reps", reps)}
          />
          <Pressable
            onPress={() => update({ dropSets: dropSets.toSpliced(idx, 1) })}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Delete dropset"
          >
            <MaterialCommunityIcons
              name="delete"
              size={22}
              color={colors.error}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
};
