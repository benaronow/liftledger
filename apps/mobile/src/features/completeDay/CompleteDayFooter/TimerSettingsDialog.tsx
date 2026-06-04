import { ActionDialog } from "../../../components/ActionDialog";
import { TimerSettings } from "../TimerSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const TimerSettingsDialog = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <ActionDialog open onClose={onClose} title="Start Timer" actions={[]}>
      <TimerSettings onTimerStarted={onClose} />
    </ActionDialog>
  );
};
