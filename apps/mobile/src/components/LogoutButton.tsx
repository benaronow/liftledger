import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth0 } from "react-native-auth0";
import { useSWRConfig } from "swr";
import { TouchableRipple, useTheme } from "../paper";
import { RADIUS } from "../theme";
import { useThemePreference } from "../providers/ThemeProvider";

export const LogoutButton = () => {
  const { clearSession } = useAuth0();
  const { mutate } = useSWRConfig();
  const { colors } = useTheme();
  const { scheme } = useThemePreference();

  // Unlike web (whose logout triggers a full page reload that wipes the SWR
  // cache), clearSession leaves the JS context intact, so the previous user's
  // cached data survives. Without clearing it, the next user briefly sees the
  // prior user's data before revalidation resolves. Wipe every cache entry to
  // match the clean slate web gets from its reload.
  const handleLogout = async () => {
    await clearSession();
    await mutate(() => true, undefined, { revalidate: false });
  };

  return (
    <TouchableRipple
      background={colors.danger}
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
