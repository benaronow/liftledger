import { ComponentProps } from "react";
import { TextInput } from "../../paper";
import { INPUT_HEIGHT, RADIUS } from "../../theme";

type Props = ComponentProps<typeof TextInput>;

// The app's standard form text field: a react-native-paper outlined input at the
// shared control height with a rounded outline. Centralizing it here keeps call
// sites from re-declaring mode/height/outlineStyle and gives the app a single
// text-input look. Every other TextInput prop passes straight through, and
// caller-supplied `style`/`outlineStyle` merge on top of the defaults.
export const AppTextInput = ({ style, outlineStyle, ...rest }: Props) => (
  <TextInput
    mode="outlined"
    style={[{ height: INPUT_HEIGHT }, style]}
    outlineStyle={[{ borderRadius: RADIUS.md }, outlineStyle]}
    {...rest}
  />
);
