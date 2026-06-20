import { useTheme } from "../../../paper";
import { INPUT_HEIGHT, RADIUS } from "../../../theme";
import { ProfileInputContainer } from "./ProfileInputContainer";
import { TextInput } from "react-native-paper";

interface Props {
  label: string;
  value: string;
  error: string;
  onChange: (value: string) => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
  onRevert?: () => void;
  disabled?: boolean;
}

export const ProfileTextInput = ({
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
  const { colors } = useTheme();

  return (
    <ProfileInputContainer
      error={error}
      onSave={onSave}
      canSave={canSave}
      isSaving={isSaving}
      onRevert={onRevert}
    >
      {({ inputRef, onFocus, onBlur }) => (
        <TextInput
          ref={inputRef}
          style={{ flex: 1, height: INPUT_HEIGHT }}
          outlineStyle={{ borderRadius: RADIUS.md }}
          label={label}
          value={value}
          error={!!error}
          onChangeText={onChange}
          mode="outlined"
          disabled={disabled}
          theme={{
            colors: { surfaceDisabled: colors.textDisabled },
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
        />
      )}
    </ProfileInputContainer>
  );
};
