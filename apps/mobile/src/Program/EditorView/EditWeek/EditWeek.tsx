import {
  getNewSetsFromLatest,
  useProgram,
  useCompletedExercises,
  useMe,
  useUpdateUser,
} from "@liftledger/api-client";
import { Day } from "@liftledger/shared";
import dayjs, { Dayjs } from "dayjs";
import { Fragment, useEffect, useState } from "react";
import { View } from "react-native";
import { AddButton } from "../../../components/AddButton";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { LabeledDateInput, LabeledTextInput } from "../../../components/inputs";
import { SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";
import { DayInfo } from "./DayInfo";
import { DeleteDayDialog } from "./DeleteDayDialog";

export const EditWeek = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { templateProgram, setTemplateProgram, editingWeekIdx, templateErrors } =
    useTemplate();
  const [deletingDayIdx, setDeletingDayIdx] = useState<number | undefined>(
    undefined,
  );

  const week = templateProgram.weeks[editingWeekIdx];

  // Seed the primary gym (and propagate it to the editing week's days +
  // exercises) from the user's first saved gym when none is set yet.
  useEffect(() => {
    if (templateProgram.primaryGym === undefined && curUser?.gyms?.length) {
      setTemplateProgram({
        ...templateProgram,
        primaryGym: curUser.gyms[0],
        weeks: templateProgram.weeks.map((w, wIdx) =>
          wIdx === editingWeekIdx
            ? w.map((day) => ({
                ...day,
                gym: curUser.gyms[0],
                exercises: day.exercises.map((exercise) => ({
                  ...exercise,
                  gym: curUser.gyms[0],
                })),
              }))
            : w,
        ),
      });
    }
  }, [templateProgram, curUser?.gyms, editingWeekIdx, setTemplateProgram]);

  const setPrimaryGym = (gym: string) => {
    const curWeekIdx = curProgram?.curWeekIdx ?? 0;
    const curDayIdx = curProgram?.curDayIdx ?? 0;

    setTemplateProgram({
      ...templateProgram,
      primaryGym: gym,
      weeks: templateProgram.weeks.map((w, wIdx) => {
        if (wIdx < curWeekIdx) return w;

        return w.map((day, dIdx) => {
          if (wIdx === curWeekIdx && dIdx < curDayIdx) return day;

          const dayHasCompletedSets = day.exercises.some((ex) =>
            ex.sets.some((s) => s.completed || s.skipped),
          );
          if (dayHasCompletedSets) return day;

          return {
            ...day,
            gym,
            exercises: day.exercises.map((exercise) => ({
              ...exercise,
              gym,
              sets: getNewSetsFromLatest(completedExercises, {
                ...exercise,
                gym,
              }),
            })),
          };
        });
      }),
    });
  };

  const handleAddGym = async (gym: string) => {
    if (!curUser) return;

    triggerUpdateUser({
      ...curUser,
      gyms: [...(curUser?.gyms || []), gym],
    });

    setPrimaryGym(gym);
  };

  const handleAddDay = (idx: number) => {
    const newDay: Day = {
      name: `Day ${week.length + 1}`,
      gym: templateProgram.primaryGym || "",
      exercises: [
        {
          name: "",
          apparatus: "",
          gym: templateProgram.primaryGym || "",
          sets: [{ reps: 0, weight: 0, completed: false, note: "" }],
          weightType: curProgram ? "lbs" : "",
        },
      ],
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((w, wIdx) =>
        wIdx === editingWeekIdx ? w.toSpliced(idx, 0, newDay) : w,
      ),
    });
  };

  const handleLengthInput = (text: string) => {
    setTemplateProgram({
      ...templateProgram,
      length: parseInt(text) || 0,
    });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateProgram({ ...templateProgram, startDate: value.toDate() });
  };

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{ width: "100%", gap: SPACING.sm, marginBottom: SPACING.lg }}
      >
        <LabeledTextInput
          label="Name:"
          value={templateProgram.name}
          onChangeText={(text) =>
            setTemplateProgram({ ...templateProgram, name: text })
          }
          placeholder="Enter program name..."
        />
        <LabeledDateInput
          label="Start:"
          value={dayjs(templateProgram.startDate)}
          onChange={handleDateInput}
        />
        <LabeledTextInput
          label="Weeks:"
          value={String(templateProgram.length)}
          onChangeText={handleLengthInput}
          keyboardType="number-pad"
        />
        <SearchableSelect
          label="Primary Gym"
          value={templateProgram.primaryGym ?? ""}
          options={curUser?.gyms || []}
          onSelect={setPrimaryGym}
          onAddCustom={handleAddGym}
          canAddCustom
          placeholder="Enter gym..."
        />
      </View>

      <View style={{ width: "100%", alignItems: "center" }}>
        {week.map((day, idx) => (
          <Fragment key={idx}>
            {week.length < 7 && <AddButton onPress={() => handleAddDay(idx)} />}
            <DayInfo
              day={day}
              dIdx={idx}
              hasErrors={templateErrors.includes(day.name)}
              onRequestDelete={setDeletingDayIdx}
            />
          </Fragment>
        ))}
        {week.length < 7 && (
          <AddButton onPress={() => handleAddDay(week.length)} />
        )}
      </View>

      <DeleteDayDialog
        deletingDayIdx={deletingDayIdx}
        onClose={() => setDeletingDayIdx(undefined)}
      />
    </View>
  );
};
