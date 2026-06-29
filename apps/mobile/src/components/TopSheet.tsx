import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal, useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../theme";

interface Props {
  open: boolean;
  onClose: () => void;
  /** When false, backdrop tap and hardware back won't close the sheet. */
  dismissable?: boolean;
  children: ReactNode;
}

const DURATION = 250;

export const TopSheet = ({
  open,
  onClose,
  dismissable = true,
  children,
}: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const enteredRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open) {
      enteredRef.current = false;
      setMounted(true);
    } else if (mounted) {
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
      if (dismissable) onClose();
      return true;
    });
    return () => sub.remove();
  }, [mounted, dismissable, onClose]);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.height;
    if (next !== height) setHeight(next);
    if (open && !enteredRef.current && next > 0) {
      enteredRef.current = true;
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-(height + insets.top), 0],
  });

  return mounted ? (
    <Portal>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: progress },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissable ? onClose : undefined}
        />
      </Animated.View>
      <Animated.View
        onLayout={onLayout}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          opacity: height > 0 ? 1 : 0,
          paddingTop: insets.top + SPACING.sm,
          backgroundColor: colors.primaryContainer,
          borderBottomLeftRadius: RADIUS.xl,
          borderBottomRightRadius: RADIUS.xl,
          transform: [{ translateY }],
        }}
      >
        {children}
      </Animated.View>
    </Portal>
  ) : null;
};
