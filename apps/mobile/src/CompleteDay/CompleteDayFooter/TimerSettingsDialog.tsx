import { Dialog } from "../../paper";
import { TimerSettings } from "../TimerSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const TimerSettingsDialog = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <Dialog visible={open} onDismiss={onClose}>
      <TimerSettings onTimerStarted={onClose} />
    </Dialog>
  );
};
