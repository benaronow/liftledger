import { View } from "react-native";
import { Text } from "react-native-paper";
import { LabeledSelect } from "./inputs";
import { SPACING } from "../theme";

const TIME_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

interface Props {
  totalSeconds: number;
  onChange: (totalSeconds: number) => void;
}

export const TimePicker = ({ totalSeconds, onChange }: Props) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.xs,
      }}
    >
      <View style={{ flex: 1 }}>
        <LabeledSelect
          value={mins.toString().padStart(2, "0")}
          options={TIME_OPTIONS}
          onChange={(value) => onChange(parseInt(value) * 60 + secs)}
        />
      </View>
      <Text style={{ fontWeight: "700" }}>:</Text>
      <View style={{ flex: 1 }}>
        <LabeledSelect
          value={secs.toString().padStart(2, "0")}
          options={TIME_OPTIONS}
          onChange={(value) => onChange(mins * 60 + parseInt(value))}
        />
      </View>
    </View>
  );
};
