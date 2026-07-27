import { Exercise, Session } from "@liftledger/shared";
import dayjs from "dayjs";
import { AppTextInput } from "../../components/inputs";
import { GymSelect } from "../../components/GymSelect";
import { AccordionRow } from "./AccordionRow";
import { ExerciseRow } from "./ExerciseRow";

interface Props {
  session: Session;
  label: string;
  onChange: (session: Session) => void;
}

export const SessionRow = ({ session, label, onChange }: Props) => {
  const setExercise = (idx: number, exercise: Exercise) =>
    onChange({
      ...session,
      exercises: session.exercises.toSpliced(idx, 1, exercise),
    });

  return (
    <AccordionRow
      title={session.name?.trim() || label}
      subtitle={
        session.completedDate
          ? dayjs(session.completedDate).format("M/DD/YY")
          : "Not completed"
      }
    >
      <AppTextInput
        label="Session name"
        value={session.name}
        onChangeText={(name) => onChange({ ...session, name })}
      />
      <GymSelect
        label="Gym"
        value={session.gym ?? ""}
        onSelect={(gym) => onChange({ ...session, gym })}
        canAddCustom
      />
      {session.exercises.map((exercise, idx) => (
        <ExerciseRow
          key={idx}
          exercise={exercise}
          onChange={(next) => setExercise(idx, next)}
        />
      ))}
    </AccordionRow>
  );
};
