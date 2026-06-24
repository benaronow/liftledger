import { ComponentProps, useState } from "react";
import { StyleSheet, TextInput as NativeTextInput, View } from "react-native";
import { HelperText, Text, TextInput } from "../../paper";
import { INPUT_HEIGHT, RADIUS } from "../../theme";

// `error` is a validation message (string), not Paper's boolean — it both
// reddens the outline and renders below the field.
type Props = Omit<ComponentProps<typeof TextInput>, "error"> & {
  error?: string;
};

export const AppTextInput = ({
  style,
  outlineStyle,
  onFocus,
  onBlur,
  multiline,
  error,
  ...rest
}: Props) => {
  const [focused, setFocused] = useState(false);
  // Multiline inputs wrap rather than overflow, so leave them on Paper's
  // default render.
  const truncating = !focused && !multiline && !!rest.value;

  return (
    <View style={[{ alignSelf: "stretch" }, style]}>
      <TextInput
        mode="outlined"
        style={{ height: INPUT_HEIGHT }}
        outlineStyle={[{ borderRadius: RADIUS.md }, outlineStyle]}
        error={!!error}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        render={
          multiline
            ? undefined
            : (props) => {
                const flat = StyleSheet.flatten(props.style);
                return (
                  <View style={{ flexGrow: 1, justifyContent: "center" }}>
                    <NativeTextInput
                      {...props}
                      style={[
                        props.style,
                        truncating ? { color: "transparent" } : null,
                      ]}
                    />
                    {truncating && (
                      <View
                        pointerEvents="none"
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            justifyContent: "center",
                            paddingHorizontal: flat.paddingHorizontal,
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ color: flat.color, fontSize: flat.fontSize }}
                        >
                          {rest.value}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }
        }
        {...rest}
      />
      {error ? (
        <HelperText type="error" visible padding="none">
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};
