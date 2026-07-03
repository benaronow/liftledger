import Fuse from "fuse.js";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  List,
  Portal,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { env } from "../config/env";
import { FONT, RADIUS, SPACING } from "../theme";
import { Sheet } from "./Sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  /** Highlighted row (the currently-selected value). */
  value?: string;
  /** Row press handler. Omit to make rows non-pressable. */
  onSelect?: (item: string) => void;
  searchPlaceholder?: string;
  /** Show the "Add …" footer when the search term is a new value. */
  canAddCustom?: boolean;
  onAddCustom?: (value: string) => Promise<void>;
  /** Options that exist but can't be picked — surfaced as "unavailable". */
  unavailableOptions?: string[];
  /** Leading accessory per row (e.g. a checkbox). */
  renderItemLeft?: (item: string) => ReactNode;
  /** Trailing accessory per row (e.g. edit/delete buttons). */
  renderItemRight?: (item: string) => ReactNode;
  /**
   * Forwarded to the FlatList so rows re-render when accessory state that
   * lives outside `options` changes (e.g. per-row toggles).
   */
  extraData?: unknown;
}

// Zero out the slide under E2E so Maestro doesn't wait on the transition,
// matching TopSheet.
const DURATION = env.e2e ? 0 : 250;

// Shared searchable list sheet used by SearchableSelect, ManageExerciseList and
// ExerciseTimerOverridesModal. Rendered via Portal + animated bottom slide
// (not a native pageSheet) so the ConfirmationDialogs some consumers open from
// inside can layer on top.
export const SelectSheet = ({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
  searchPlaceholder,
  canAddCustom,
  onAddCustom,
  unavailableOptions,
  renderItemLeft,
  renderItemRight,
  extraData,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: screenHeight } = useWindowDimensions();

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      setQuery("");
      Animated.timing(progress, {
        toValue: 0,
        duration: DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const fuse = useMemo(() => new Fuse(options, { threshold: 0.4 }), [options]);
  const filteredOptions = useMemo(
    () =>
      query.trim() === "" ? options : fuse.search(query).map((r) => r.item),
    [fuse, query, options],
  );

  const trimmed = query.trim();

  const isUnavailable = useMemo(
    () =>
      trimmed !== "" &&
      (unavailableOptions?.some(
        (o) => o.toLowerCase() === trimmed.toLowerCase(),
      ) ??
        false),
    [trimmed, unavailableOptions],
  );

  const isCustom = useMemo(
    () =>
      trimmed !== "" &&
      !isUnavailable &&
      !options.some((o) => o.toLowerCase() === trimmed.toLowerCase()),
    [trimmed, options, isUnavailable],
  );

  const showAddOrUnavailable =
    (canAddCustom ?? false) && (isCustom || isUnavailable);

  const handleAddCustom = async () => {
    setAddingCustom(true);
    try {
      await onAddCustom?.(trimmed);
      setQuery("");
    } catch {
      // Swallow — leave the field as-is, like web.
    }
    setAddingCustom(false);
  };

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  if (!mounted) return null;

  return (
    <Portal>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: progress },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.primaryContainer,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          overflow: "hidden",
          transform: [{ translateY }],
        }}
      >
        <Sheet
          title={title}
          actions={[{ label: "Done", onPress: onClose }]}
          keyboardAvoiding
          headerColor={colors.secondaryContainer}
        >
          <Searchbar
            testID="select-search"
            style={{
              marginHorizontal: SPACING.lg - 14,
            }}
            inputStyle={{ color: colors.onSurface }}
            placeholderTextColor={colors.onSurfaceDisabled}
            value={query}
            onChangeText={setQuery}
            placeholder={
              searchPlaceholder ??
              (canAddCustom ? "Search or add..." : "Search...")
            }
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
          />
          <View
            style={{
              marginHorizontal: SPACING.lg,
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.outlineVariant,
            }}
          />
          <FlatList
            style={{ flex: 1 }}
            data={filteredOptions}
            extraData={extraData}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item}
            contentContainerStyle={{
              paddingBottom: insets.bottom + SPACING.md,
            }}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  marginHorizontal: SPACING.lg,
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: colors.outlineVariant,
                }}
              />
            )}
            renderItem={({ item }) => (
              <Pressable
                testID={`select-option-${item}`}
                onPress={onSelect ? () => onSelect(item) : undefined}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.md,
                  minHeight: 48,
                  backgroundColor:
                    item === value ? colors.primary : colors.primaryContainer,
                }}
              >
                {renderItemLeft?.(item)}
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: colors.onSurface,
                    fontSize: FONT.base,
                  }}
                >
                  {item}
                </Text>
                {renderItemRight?.(item)}
              </Pressable>
            )}
            ListFooterComponent={
              showAddOrUnavailable ? (
                <List.Item
                  testID="select-add-custom"
                  title={
                    addingCustom ? (
                      <View style={{ paddingVertical: SPACING.xs }}>
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
                      </View>
                    ) : isUnavailable ? (
                      `"${trimmed}" is unavailable`
                    ) : (
                      `Add "${trimmed}"`
                    )
                  }
                  titleStyle={{ color: colors.primary, fontSize: FONT.sm }}
                  onPress={isUnavailable ? undefined : handleAddCustom}
                  disabled={isUnavailable}
                />
              ) : null
            }
          />
        </Sheet>
      </Animated.View>
    </Portal>
  );
};
