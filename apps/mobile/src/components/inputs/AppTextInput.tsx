import { ComponentProps, useState } from "react";
import { StyleSheet, TextInput as NativeTextInput, View } from "react-native";
import { Text, TextInput } from "../../paper";
import { INPUT_HEIGHT, RADIUS } from "../../theme";

type Props = ComponentProps<typeof TextInput>;

// The app's standard form text field: a react-native-paper outlined input at the
// shared control height with a rounded outline. Centralizing it here keeps call
// sites from re-declaring mode/height/outlineStyle and gives the app a single
// text-input look. Every other TextInput prop passes straight through, and
// caller-supplied `style`/`outlineStyle` merge on top of the defaults.
//
// When blurred, the value is drawn by a centered overlay Text so a long
// single-line value truncates with an ellipsis (an editable single-line
// TextInput clips without one). The real input stays mounted underneath for
// focus/editing — its glyphs are just hidden while the overlay shows — and the
// overlay is positioned from Paper's own computed input style, so there's no
// shift between the blurred and focused states.
export const AppTextInput = ({
  style,
  outlineStyle,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: Props) => {
  const [focused, setFocused] = useState(false);
  // Multiline inputs wrap rather than overflow, so leave them on Paper's
  // default render.
  const truncating = !focused && !multiline && !!rest.value;

  return (
    <TextInput
      mode="outlined"
      style={[{ height: INPUT_HEIGHT }, style]}
      outlineStyle={[{ borderRadius: RADIUS.md }, outlineStyle]}
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
  );
};
