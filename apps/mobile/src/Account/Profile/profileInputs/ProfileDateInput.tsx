import { View } from "react-native";
import { DatePickerInput } from "react-native-paper-dates";
import { PaperProvider, useTheme } from "react-native-paper";
import { INPUT_HEIGHT, RADIUS } from "../../../theme";
import { ProfileInputContainer } from "./ProfileInputContainer";

interface Props {
  label: string;
  value: Date | undefined;
  error: string;
  onChange: (value: Date | undefined) => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
  onRevert?: () => void;
  disabled?: boolean;
}

export const ProfileDateInput = ({
  label,
  value,
  error,
  onChange,
  onSave,
  canSave,
  isSaving,
  onRevert,
  disabled,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;

  const modalTheme = {
    ...theme,
    colors: {
      ...colors,
      surface: colors.background,
      surfaceDisabled: colors.onSurfaceDisabled,
    },
  };

  return (
    <ProfileInputContainer
      error={error}
      onSave={onSave}
      canSave={canSave}
      isSaving={isSaving}
      onRevert={onRevert}
    >
      {({ inputRef, onFocus, onBlur }) => (
        <View style={{ flex: 1 }}>
          <PaperProvider theme={modalTheme}>
            <DatePickerInput
              ref={inputRef}
              style={{ height: INPUT_HEIGHT }}
              outlineStyle={{ borderRadius: RADIUS.md }}
              label={label}
              value={value}
              error={!!error}
              onChange={(date) => {
                onChange(date);
                requestAnimationFrame(() => {
                  onFocus();
                  inputRef.current?.focus();
                });
              }}
              inputMode="start"
              locale="en"
              mode="outlined"
              disabled={disabled}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </PaperProvider>
        </View>
      )}
    </ProfileInputContainer>
  );
};
