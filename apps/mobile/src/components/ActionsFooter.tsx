import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { ReactNode, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { RADIUS, SPACING } from "../theme";
import { ActionButton, Variant } from "./ActionButton";

export interface FooterAction {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
}

// LayoutAnimation needs an explicit opt-in on (old-arch) Android; harmless on iOS.
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Bottom action bar mirroring web's ActionsFooter: the first action is the
// always-visible primary button; any extras live behind a menu toggle that
// slides a secondary row up above it.
export const ActionsFooter = ({ actions }: { actions: FooterAction[] }) => {
  const [expanded, setExpanded] = useState(false);
  const primary = actions[0];
  const secondary = actions.slice(1);
  const hasSecondary = secondary.length > 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const sideColor = primary.disabled ? COLORS.primaryDisabled : COLORS.primary;

  return (
    <View style={styles.footer}>
      {hasSecondary && expanded && (
        <View style={styles.secondaryPanel}>
          {secondary.map((action, idx) => (
            <View key={idx} style={styles.secondaryCell}>
              <ActionButton
                icon={action.icon}
                label={action.label}
                onPress={() => {
                  action.onPress();
                  setExpanded(false);
                }}
                disabled={action.disabled}
                variant={action.variant}
                height={50}
                roundedSide="0"
              />
            </View>
          ))}
        </View>
      )}
      <View style={styles.primaryRow}>
        {hasSecondary && (
          <ActionButton
            icon={
              <Ionicons
                name={expanded ? "close" : "menu"}
                size={22}
                color="white"
              />
            }
            onPress={toggle}
            variant="primary"
            height={50}
            width={50}
            roundedSide="0"
          />
        )}
        <View style={styles.primaryCell}>
          <ActionButton
            icon={primary.icon}
            label={primary.label}
            onPress={primary.onPress}
            disabled={primary.disabled}
            variant={primary.variant}
            height={50}
            roundedSide="0"
          />
        </View>
        {/* Mirror the menu toggle's width on the right so the primary label
            stays centered in the bar. */}
        {hasSecondary && (
          <View style={[styles.spacer, { backgroundColor: sideColor }]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  secondaryPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.container,
  },
  secondaryCell: { flex: 1 },
  primaryRow: { flexDirection: "row", alignItems: "center" },
  primaryCell: { flex: 1 },
  spacer: { width: 50, height: 50 },
});
