import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";
import { View } from "react-native";
import { Icon, Snackbar, Text, useTheme } from "../paper";
import { SPACING } from "../theme";

type SnackbarVariant = "success" | "error";

// App-wide transient feedback. A single Paper Snackbar lives at the provider
// root (positioned absolutely at the bottom) and any call site triggers it via
// `useSnackbar().showSnackbar(message, variant)`. The variant drives a left
// icon: a green check for "success", a red alert for "error".
interface SnackbarValue {
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
}

const SnackbarContext = createContext<SnackbarValue>({
  showSnackbar: () => undefined,
});

export const SnackbarProvider = ({ children }: PropsWithChildren) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<SnackbarVariant>("success");
  const [visible, setVisible] = useState(false);

  const showSnackbar = useCallback(
    (msg: string, v: SnackbarVariant = "success") => {
      setMessage(msg);
      setVariant(v);
      setVisible(true);
    },
    [],
  );

  const icon = variant === "success" ? "check-circle" : "alert-circle";
  const iconColor = variant === "success" ? colors.success : colors.danger;

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
          }}
        >
          <Icon source={icon} size={20} color={iconColor} />
          <Text style={{ color: colors.inverseOnSurface, flexShrink: 1 }}>
            {message}
          </Text>
        </View>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
