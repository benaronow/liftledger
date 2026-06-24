import {
  getNewSetsFromLatest,
  useProgram,
  useCompletedExercises,
  useMe,
  useUpdateUser,
} from "@liftledger/api-client";
import { Day } from "@liftledger/shared";
import { Fragment, useEffect, useState } from "react";
import { View } from "react-native";
import { DatePickerInput } from "react-native-paper-dates";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { PaperProvider, useTheme } from "../../../paper";
import { AddRow } from "../../../components/AddRow";
import { AppTextInput, NumberInput } from "../../../components/inputs";
import { SectionCard } from "../../../components/SectionCard";
import { INPUT_HEIGHT, RADIUS, SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";
import { DayInfo } from "./DayInfo";
import { DeleteDayDialog } from "./DeleteDayDialog";

export const EditWeek = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const {
    templateProgram,
    setTemplateProgram,
    editingWeekIdx,
    templateErrors,
  } = useTemplate();
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
          sets: [{ reps: null, weight: null, completed: false, note: "" }],
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

  // An empty field commits null, which we ignore so clearing it mid-edit
  // doesn't reset the length to 0 — it snaps back on blur.
  const handleLengthInput = (length: number | null) => {
    if (length == null) return;
    setTemplateProgram({ ...templateProgram, length });
  };

  const handleDateInput = (date: Date | undefined) => {
    if (date) setTemplateProgram({ ...templateProgram, startDate: date });
  };

  const modalTheme = {
    ...theme,
    colors: {
      ...colors,
      surface: colors.background,
      surfaceDisabled: colors.textDisabled,
    },
  };

  return (
    <View style={{ width: "100%" }}>
      <SectionCard title="Program Details" style={{ marginBottom: SPACING.lg }}>
        <AppTextInput
          label="Name"
          value={templateProgram.name}
          error={templateErrors.program.name}
          onChangeText={(text) =>
            setTemplateProgram({ ...templateProgram, name: text })
          }
          placeholder="Enter program name..."
          autoCapitalize="none"
        />
        <View>
          <PaperProvider theme={modalTheme}>
            <DatePickerInput
              style={{ height: INPUT_HEIGHT }}
              outlineStyle={{ borderRadius: RADIUS.md }}
              mode="outlined"
              locale="en"
              label="Start Date"
              value={
                templateProgram.startDate
                  ? new Date(templateProgram.startDate)
                  : undefined
              }
              onChange={handleDateInput}
              inputMode="start"
            />
          </PaperProvider>
        </View>
        <NumberInput
          label="Weeks"
          value={templateProgram.length}
          error={templateErrors.program.length}
          onChangeValue={handleLengthInput}
        />
        <SearchableSelect
          label="Primary Gym"
          error={templateErrors.program.primaryGym}
          value={templateProgram.primaryGym ?? ""}
          options={curUser?.gyms || []}
          onSelect={setPrimaryGym}
          onAddCustom={handleAddGym}
          canAddCustom
          placeholder="Enter or add a gym..."
        />
      </SectionCard>

      <View style={{ width: "100%", alignItems: "center" }}>
        {week.map((day, idx) => (
          <Fragment key={idx}>
            {week.length < 7 && <AddRow onPress={() => handleAddDay(idx)} />}
            <DayInfo
              day={day}
              dIdx={idx}
              errors={templateErrors.days[idx]}
              onRequestDelete={setDeletingDayIdx}
            />
          </Fragment>
        ))}
        {week.length < 7 && (
          <AddRow onPress={() => handleAddDay(week.length)} />
        )}
      </View>

      <DeleteDayDialog
        deletingDayIdx={deletingDayIdx}
        onClose={() => setDeletingDayIdx(undefined)}
      />
    </View>
  );
};
