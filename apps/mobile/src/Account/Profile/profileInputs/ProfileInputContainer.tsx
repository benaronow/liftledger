import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { HelperText, useTheme } from "../../../paper";
import { SPACING } from "../../../theme";
import { IconButton } from "react-native-paper";
import { TextInput as RNTextInput } from "react-native";

interface InputHandlers {
  inputRef: React.RefObject<RNTextInput | null>;
  onFocus: () => void;
  onBlur: () => void;
}

interface Props {
  children(handlers: InputHandlers): React.ReactNode;
  error: string;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
  onRevert?: () => void;
}

export const ProfileInputContainer = ({
  children,
  error,
  onSave,
  canSave,
  isSaving,
  onRevert,
}: Props) => {
  const { colors } = useTheme();
  const [fieldSelected, setFieldSelected] = useState(false);

  const width = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fieldSelected) {
      Animated.sequence([
        Animated.timing(width, {
          toValue: 45 + SPACING.sm,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(width, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [fieldSelected, opacity, width]);

  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (!isSaving && !error) {
      setFieldSelected(false);
      inputRef.current?.blur();
    }
  }, [isSaving, error]);

  const savePressed = useRef(false);

  const handleBlur = () => {
    if (savePressed.current === false) {
      setFieldSelected(false);
      onRevert?.();
    }
  };

  const handleSave = () => {
    onSave();
    savePressed.current = false;
  };

  const handleSavePressIn = () => {
    savePressed.current = true;
  };

  return (
    <View style={{ width: "100%", gap: SPACING.xs, alignItems: "flex-start" }}>
      <View
        ref={inputRef}
        style={{
          flexDirection: "row",
          width: "100%",
          maxWidth: "100%",
          alignItems: "flex-end",
        }}
      >
        {children({
          inputRef,
          onFocus: () => setFieldSelected(true),
          onBlur: handleBlur,
        })}
        <Animated.View
          style={{
            width,
            opacity,
            height: 45,
            overflow: "hidden",
            alignItems: "flex-end",
          }}
          pointerEvents={fieldSelected ? "auto" : "none"}
        >
          <IconButton
            style={{
              margin: 0,
              marginLeft: SPACING.sm,
              height: 45,
              width: 45,
              borderRadius: 8,
              flexDirection: "column",
              justifyContent: "center",
            }}
            icon="content-save"
            containerColor={colors.primary}
            iconColor={colors.onPrimary}
            loading={isSaving}
            onPress={handleSave}
            onPressIn={handleSavePressIn}
            disabled={!canSave}
            mode="contained"
          />
        </Animated.View>
      </View>
      {error ? (
        <HelperText
          type="error"
          visible
          padding="none"
          style={{ paddingTop: 0 }}
        >
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};
