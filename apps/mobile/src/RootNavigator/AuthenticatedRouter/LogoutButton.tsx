import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableRipple, useTheme } from "../../paper";
import { RADIUS } from "../../theme";
import { useThemePreference } from "../../providers/ThemeProvider";
import { useLogout } from "./useLogout";

export const LogoutButton = () => {
  const { colors } = useTheme();
  const { scheme } = useThemePreference();
  const handleLogout = useLogout();

  return (
    <TouchableRipple
      rippleColor={colors.danger}
      onPress={handleLogout}
      style={{
        borderRadius: RADIUS.md,
        overflow: "hidden",
      }}
    >
      <MaterialCommunityIcons
        name="logout"
        size={22}
        color={scheme === "dark" ? "white" : "black"}
      />
    </TouchableRipple>
  );
};
