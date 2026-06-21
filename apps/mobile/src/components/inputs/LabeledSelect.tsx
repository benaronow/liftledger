import { ReactNode, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Divider,
  List,
  Portal,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "../../paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FONT, RADIUS, SPACING } from "../../theme";
import { LabeledInputContainer } from "./LabeledInputContainer";

interface Props {
  label?: string;
  error?: string;
  value?: string;
  options: string[];
  includeEmptyOption?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  height?: number;
  renderEnd?: () => ReactNode;
}

const EMPTY_LABEL = "-- Select --";

// Native replacement for web's <FormSelect>: a tappable field that opens a
// bottom-anchored list of options.
export const LabeledSelect = ({
  label,
  error,
  value,
  options,
  includeEmptyOption,
  onChange,
  disabled,
  height,
  renderEnd,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  const select = (option: string) => {
    onChange?.(option);
    setOpen(false);
  };

  const listOptions = includeEmptyOption ? ["", ...options] : options;

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <TouchableRipple
        style={{
          flex: 1,
          borderRadius: RADIUS.md,
          height: height ?? 35,
          backgroundColor: disabled ? colors.textDisabled : "white",
          justifyContent: "center",
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        }}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: SPACING.sm,
          }}
        >
          <Text style={{ flex: 1, fontSize: FONT.base, color: "black" }} numberOfLines={1}>
            {value || EMPTY_LABEL}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={colors.container} />
        </View>
      </TouchableRipple>

      {open && (
        <Portal>
          <Pressable
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setOpen(false)}
          >
            <Pressable onPress={() => {}}>
              <Surface
                style={{
                  borderTopLeftRadius: RADIUS.xl,
                  borderTopRightRadius: RADIUS.xl,
                  paddingVertical: SPACING.md,
                  maxHeight: "60%",
                  backgroundColor: colors.container,
                }}
              >
                {label && (
                  <>
                    <Text
                      variant="titleMedium"
                      style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm }}
                    >
                      {label}
                    </Text>
                    <Divider />
                  </>
                )}
                <FlatList
                  data={listOptions}
                  keyExtractor={(item) => item || "__empty__"}
                  contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
                  renderItem={({ item }) => (
                    <List.Item
                      title={item || EMPTY_LABEL}
                      titleStyle={{
                        color: item === value ? colors.primary : colors.text,
                        fontWeight: item === value ? "700" : "400",
                      }}
                      onPress={() => select(item)}
                      right={(props) =>
                        item === value ? (
                          <MaterialCommunityIcons
                            {...props}
                            name="check"
                            size={18}
                            color={colors.primary}
                          />
                        ) : null
                      }
                    />
                  )}
                />
              </Surface>
            </Pressable>
          </Pressable>
        </Portal>
      )}
    </LabeledInputContainer>
  );
};
