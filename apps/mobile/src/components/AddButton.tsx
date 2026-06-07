import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { TouchableRipple, useTheme } from "../paper";

interface Props {
  onPress: () => void;
}

// A horizontal rule with a "+" pill in the middle — divides a list while
// offering an add affordance (web's AddButton).
export const AddButton = ({ onPress }: Props) => {
  const { colors } = useTheme();
  const lineStyle = { flex: 1, height: 2, backgroundColor: colors.primary };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
        marginBottom: 8,
      }}
    >
      <View style={lineStyle} />
      <TouchableRipple
        borderless
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: 20,
          width: 20,
          borderRadius: 10,
          marginHorizontal: 8,
          backgroundColor: colors.primary,
        }}
        onPress={onPress}
      >
        <MaterialCommunityIcons name="plus" size={16} color="white" />
      </TouchableRipple>
      <View style={lineStyle} />
    </View>
  );
};
