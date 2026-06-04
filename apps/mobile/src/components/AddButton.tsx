import { COLORS } from "@liftledger/shared";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
  onPress: () => void;
}

// A horizontal rule with a "+" pill in the middle — divides a list while
// offering an add affordance (web's AddButton).
export const AddButton = ({ onPress }: Props) => (
  <View style={styles.container}>
    <View style={styles.line} />
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name="add" size={16} color="white" />
    </Pressable>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 8,
  },
  line: { flex: 1, height: 2, backgroundColor: COLORS.primary },
  button: {
    alignItems: "center",
    justifyContent: "center",
    height: 20,
    width: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    backgroundColor: COLORS.primary,
  },
});
