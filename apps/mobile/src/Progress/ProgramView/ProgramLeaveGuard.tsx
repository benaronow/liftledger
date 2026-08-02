import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { useLeaveGuard } from "../../RootNavigator/TabNavigator/LeaveGuardProvider";
import type { ProgressStackNav } from "../../RootNavigator/types";
import { useProgramEdit } from "./ProgramEditProvider";

export const ProgramLeaveGuard = () => {
  const navigation = useNavigation<ProgressStackNav<"ProgramDetail">>();
  const isFocused = useIsFocused();
  const { dirty, reset } = useProgramEdit();
  const { registerGuard } = useLeaveGuard();
  const [open, setOpen] = useState(false);
  const proceedRef = useRef<(() => void) | null>(null);
  const bypassRef = useRef(false);

  useEffect(() => {
    if (!dirty || !isFocused) return;
    registerGuard("Progress", (proceed) => {
      proceedRef.current = proceed;
      setOpen(true);
      return true;
    });
    return () => registerGuard("Progress", null);
  }, [dirty, isFocused, registerGuard]);

  useEffect(() => {
    if (!dirty || !isFocused) return;
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (bypassRef.current) {
        bypassRef.current = false;
        return;
      }
      e.preventDefault();
      proceedRef.current = () => {
        bypassRef.current = true;
        navigation.dispatch(e.data.action);
      };
      setOpen(true);
    });
    return sub;
  }, [dirty, isFocused, navigation]);

  useEffect(() => {
    if (!isFocused || !dirty) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (navigation.canGoBack()) return false;
      proceedRef.current = () => navigation.getParent()?.navigate("Dashboard");
      setOpen(true);
      return true;
    });
    return () => sub.remove();
  }, [isFocused, dirty, navigation]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    reset();
    const proceed = proceedRef.current;
    proceedRef.current = null;
    proceed?.();
  }, [reset]);

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
