import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { Program, Day, Exercise } from "@liftledger/shared";
import {
  useCurrentDay,
  useMe,
  useUpdateUserProgram,
  useProgram,
} from "@liftledger/api-client";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { Spinner } from "react-bootstrap";

interface Props {
  deletingIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({ deletingIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: deletingExercise } =
    useUpdateUserProgram();
  const { exercises } = useCurrentDay();

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;
    const newDays: Day[] = curProgram.weeks[curProgram.curWeekIdx].toSpliced(
      curProgram.curDayIdx,
      1,
      {
        ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
        exercises,
      },
    );
    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(curProgram.curWeekIdx, 1, newDays),
    };
    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
  };

  const handleDeleteExercise = async () => {
    if (deletingIdx === undefined) return;
    const updated = exercises.filter(
      (_: Exercise, i: number) => i !== deletingIdx,
    );
    await saveExercises(updated);
    onClose();
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "dangerInverted",
      disabled: deletingExercise,
    },
    {
      icon: deletingExercise ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaTrash fontSize={26} />
      ),
      onClick: handleDeleteExercise,
      variant: "danger",
      disabled: deletingExercise,
    },
  ];

  return (
    <>
      {deletingIdx !== undefined && (
        <ActionDialog
          open={deletingIdx !== undefined}
          onClose={onClose}
          title="Remove Exercise"
          actions={deleteActions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to remove this add-on exercise?
            </span>
            <strong className="text-white text-wrap">
              This action cannot be undone.
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
