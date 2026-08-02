import { ReactNode, useState } from "react";
import { View } from "react-native";
import { Button, IconButton, useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../../../theme";
import { DeleteOptionDialog } from "./DeleteOptionDialog";
import { OptionType, RenameOptionDialog } from "./RenameOptionDialog";

export interface OptionSelectProps {
  /** Titles the management sheet (the select's input is replaced by the trigger). */
  label: string;
  value: string;
  dismissOnSelect: boolean;
  onSelect: (value: string) => void;
  renderTrigger: (open: () => void) => ReactNode;
  trailing: (item: string) => ReactNode;
}

interface Props {
  optionType: OptionType;
  buttonLabel: string;
  singular: string;
  fieldLabel: string;
  options: string[];
  onDelete: (value: string) => Promise<void>;
  children: (props: OptionSelectProps) => ReactNode;
}

export const ManageOptions = ({
  optionType,
  buttonLabel,
  singular,
  fieldLabel,
  options,
  onDelete,
  children,
}: Props) => {
  const { colors } = useTheme();

  const [renaming, setRenaming] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<string>();

  return (
    <>
      {children({
        label: buttonLabel,
        value: "",
        dismissOnSelect: false,
        onSelect: setRenaming,
        renderTrigger: (open) => (
          <Button mode="contained" onPress={open}>
            {buttonLabel}
          </Button>
        ),
        trailing: (item) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              mode="contained"
              icon="pencil"
              size={18}
              containerColor={colors.primary}
              iconColor={colors.onPrimary}
              style={{
                margin: 0,
                marginRight: SPACING.sm,
                borderRadius: RADIUS.sm,
              }}
              accessibilityLabel={`rename-option-${item}`}
              onPress={() => setRenaming(item)}
            />
            <IconButton
              mode="contained"
              icon="trash-can-outline"
              size={18}
              containerColor={colors.error}
              iconColor={colors.onError}
              style={{ margin: 0, borderRadius: RADIUS.sm }}
              accessibilityLabel={`delete-option-${item}`}
              onPress={() => setPendingDelete(item)}
            />
          </View>
        ),
      })}
      <RenameOptionDialog
        field={optionType}
        singular={singular}
        label={fieldLabel}
        original={renaming}
        options={options}
        onClose={() => setRenaming(undefined)}
      />
      <DeleteOptionDialog
        singular={singular}
        pending={pendingDelete}
        onDelete={onDelete}
        onClose={() => setPendingDelete(undefined)}
      />
    </>
  );
};
