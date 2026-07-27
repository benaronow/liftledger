import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { useLeaveGuard } from "../../RootNavigator/TabNavigator/LeaveGuardProvider";
import type { TabNav } from "../../RootNavigator/types";
import { useTemplate } from "../TemplateProvider";

export const ProgramLeaveGuard = () => {
  const navigation = useNavigation<TabNav<"Program">>();
  const isFocused = useIsFocused();
  const { dirty, resetTemplate } = useTemplate();
  const { registerGuard } = useLeaveGuard();
  const [open, setOpen] = useState(false);
  const proceedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!dirty) return;

    registerGuard("Program", (proceed) => {
      proceedRef.current = proceed;
      setOpen(true);
      return true;
    });

    return () => registerGuard("Program", null);
  }, [dirty, registerGuard]);

  useEffect(() => {
    if (!isFocused || !dirty) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      proceedRef.current = () => navigation.navigate("Dashboard");
      setOpen(true);
      return true;
    });

    return () => sub.remove();
  }, [isFocused, dirty, navigation]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    resetTemplate();
    const proceed = proceedRef.current;
    proceedRef.current = null;
    proceed?.();
  }, [resetTemplate]);

  const handleClose = useCallback(() => {
    setOpen(false);
    proceedRef.current = null;
  }, []);

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleClose}
      title="Unsaved Changes"
      destructive
      action="Discard"
      onConfirm={handleConfirm}
      description="You have unsaved changes to this program."
      emphasis="If you leave now, your changes will be lost."
    />
  );
};
