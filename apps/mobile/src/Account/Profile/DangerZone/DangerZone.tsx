import { useState } from "react";
import { Text, useTheme } from "../../../paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { Button, Surface } from "react-native-paper";

export const DangerZone = () => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <Surface
        elevation={1}
        style={{
          width: "100%",
          backgroundColor: colors.danger,
          borderRadius: RADIUS.md,
          gap: SPACING.md,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: FONT.base,
            fontWeight: "800",
            alignSelf: "flex-start",
          }}
        >
          Danger Zone
        </Text>
        <Button
          style={{
            flexDirection: "column",
            height: 45,
            justifyContent: "center",
          }}
          buttonColor="white"
          textColor={colors.danger}
          mode="contained"
          icon="delete"
          onPress={() => setOpen(true)}
        >
          Delete Account
        </Button>
      </Surface>
      <DeleteAccountDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
