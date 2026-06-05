import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useState } from "react";
import { Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { FONT, RADIUS, SPACING } from "../theme";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export const DangerZone = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <View
        style={{
          width: "100%",
          backgroundColor: COLORS.danger,
          borderRadius: RADIUS.md,
          gap: SPACING.md,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: FONT.lg,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Danger Zone
        </Text>
        <ActionButton
          label="Delete Account"
          icon={<Ionicons name="trash" size={18} color={COLORS.danger} />}
          variant="dangerInverted"
          onPress={() => setOpen(true)}
        />
      </View>
      <DeleteAccountDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
