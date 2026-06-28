import { useState } from "react";
import { useTheme } from "react-native-paper";
import { SectionCard } from "../../../components/SectionCard";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { Button } from "react-native-paper";

export const DangerZone = () => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <SectionCard
        title="Danger Zone"
        background={colors.error}
        titleColor="white"
      >
        <Button
          style={{
            flexDirection: "column",
            height: 45,
            justifyContent: "center",
          }}
          buttonColor="white"
          textColor={colors.error}
          mode="contained"
          icon="delete"
          onPress={() => setOpen(true)}
        >
          Delete Account
        </Button>
      </SectionCard>
      <DeleteAccountDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
