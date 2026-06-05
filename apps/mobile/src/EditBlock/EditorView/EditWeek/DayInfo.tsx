import { Ionicons } from "@expo/vector-icons";
import { useBlock, useMe } from "@liftledger/api-client";
import { COLORS, Day } from "@liftledger/shared";
import { Text } from "react-native";
import { FONT } from "../../../theme";
import { Info, InfoAction } from "../Info";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  day: Day;
  dIdx: number;
  hasErrors: boolean;
  onRequestDelete: (dIdx: number) => void;
}

export const DayInfo = ({ day, dIdx, hasErrors, onRequestDelete }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { templateBlock, setTemplateBlock, editingWeekIdx, setEditingDayIdx } =
    useTemplate();

  const week = templateBlock.weeks[editingWeekIdx];

  const handleMoveDay = (
    movedDay: Day,
    dayIdx: number,
    type: "up" | "down",
  ) => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((w, idx) =>
          idx === editingWeekIdx
            ? w
                .toSpliced(dayIdx, 1)
                .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, movedDay)
            : w,
        ),
      });
    }
  };

  const handleDuplicateDay = (dayIdx: number) => {
    const copy: Day = {
      ...templateBlock.weeks[templateBlock.weeks.length - 1][dayIdx],
      name: `${templateBlock.weeks[0][dayIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((w, idx) =>
        idx === editingWeekIdx ? w.toSpliced(dayIdx + 1, 0, copy) : w,
      ),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: <Ionicons name="chevron-up" size={22} color="white" />,
      disabled: dIdx === curBlock?.curDayIdx || dIdx === 0,
      onPress: () => handleMoveDay(day, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: <Ionicons name="chevron-down" size={22} color="white" />,
      disabled: dIdx === week.length - 1,
      onPress: () => handleMoveDay(day, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: <Ionicons name="create" size={22} color="white" />,
      onPress: () => setEditingDayIdx(dIdx),
      variant: "primary",
    },
    {
      icon: <Ionicons name="duplicate" size={22} color="white" />,
      disabled: week.length > 6,
      onPress: () => handleDuplicateDay(dIdx),
      variant: "primary",
    },
    {
      icon: <Ionicons name="trash" size={20} color="white" />,
      disabled: week.length === 1,
      onPress: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const disabledMessage =
    curBlock && curBlock.curDayIdx > dIdx
      ? "Day complete, cannot be edited or moved until next week."
      : "";

  const exerciseCount = day.exercises.reduce(
    (acc, ex) =>
      acc + (ex.addedOn ? 0 : ex.sets.filter((s) => !s.addedOn).length),
    0,
  );

  const hasListedExercises = day.exercises.some(
    (e) => e.name && e.apparatus && e.sets.length,
  );

  return (
    <Info
      title={`Day ${dIdx + 1}`}
      actions={infoActions}
      disabledMessage={disabledMessage}
    >
      <Text style={boldStyle}>{`Name: ${day.name} [${exerciseCount}]`}</Text>
      {hasListedExercises &&
        day.exercises
          .filter((ex) => !ex.addedOn)
          .map((ex, i) => (
            <Text style={lineStyle} key={ex._id ?? i}>
              {`${i + 1}. ${ex.name} [${ex.sets.filter((s) => !s.addedOn).length}]`}
            </Text>
          ))}
      {hasErrors && (
        <Text style={errorStyle}>Must add at least one exercise.</Text>
      )}
    </Info>
  );
};

const boldStyle = {
  color: "white",
  fontSize: FONT.sm,
  fontWeight: "700" as const,
};
const lineStyle = { color: "white", fontSize: FONT.sm };
const errorStyle = {
  color: COLORS.danger,
  fontSize: FONT.sm,
  fontWeight: "700" as const,
};
