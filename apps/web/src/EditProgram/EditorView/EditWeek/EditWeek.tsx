import { Day } from "@liftledger/shared";
import dayjs, { Dayjs } from "dayjs";
import React, { ChangeEvent, useEffect, useState } from "react";
import { AddButton } from "@/components/AddButton";
import { DayInfo } from "./DayInfo";
import {
  getNewSetsFromLatest,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useProgram,
} from "@liftledger/api-client";
import { DeleteDayDialog } from "./DeleteDayDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useTemplate } from "../../TemplateProvider";
import { LabeledTextInput, LabeledDateInput } from "@/components/inputs";

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

  useEffect(() => {
    if (templateProgram.primaryGym === undefined && curUser?.gyms?.length) {
      setTemplateProgram({
        ...templateProgram,
        primaryGym: curUser.gyms[0],
        weeks: templateProgram.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day) => ({
                ...day,
                gym: curUser.gyms[0],
                exercises: day.exercises.map((exercise) => ({
                  ...exercise,
                  gym: curUser.gyms[0],
                })),
              }))
            : week,
        ),
      });
    }
  }, [templateProgram, curUser?.gyms, editingWeekIdx, setTemplateProgram]);

  const handleProgramNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateProgram({ ...templateProgram, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateProgram({ ...templateProgram, startDate: value.toDate() });
  };

  const setPrimaryGym = (gym: string) => {
    const curWeekIdx = curProgram?.curWeekIdx ?? 0;
    const curDayIdx = curProgram?.curDayIdx ?? 0;

    setTemplateProgram({
      ...templateProgram,
      primaryGym: gym,
      weeks: templateProgram.weeks.map((week, wIdx) => {
        if (wIdx < curWeekIdx) return week;

        return week.map((day, dIdx) => {
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
      name: `Day ${templateProgram.weeks[editingWeekIdx].length + 1}`,
      gym: templateProgram.primaryGym || "",
      exercises: [
        {
          name: "",
          apparatus: "",
          gym: templateProgram.primaryGym || "",
          sets: [
            {
              reps: 0,
              weight: 0,
              completed: false,
              note: "",
            },
          ],
          weightType: curProgram ? "lbs" : "",
        },
      ],
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx ? week.toSpliced(idx, 0, newDay) : week,
      ),
    });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateProgram({
      ...templateProgram,
      length: parseInt(e.target.value) || 0,
    });
  };

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100"
        style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
      >
        <div
          className="d-flex flex-column w-100 text-white"
          style={{ gap: "10px", marginBottom: "20px" }}
        >
          <LabeledTextInput
            label="Name: "
            value={templateProgram.name}
            onChange={handleProgramNameInput}
            placeholder="Enter program name..."
          />
          <LabeledDateInput
            label="Start: "
            value={dayjs(templateProgram.startDate)}
            onChange={handleDateInput}
          />
          <LabeledTextInput
            label="Weeks: "
            value={templateProgram.length}
            onChange={handleLengthInput}
          />
          <SearchableSelect
            label="Primary Gym:"
            value={templateProgram.primaryGym ?? ""}
            options={curUser?.gyms || []}
            onSelect={(gym: string) => setPrimaryGym(gym)}
            onAddCustom={handleAddGym}
            canAddCustom
            placeholder="Enter gym..."
          />
        </div>
        <div className="d-flex flex-column align-items-center gap-2 w-100">
          {templateProgram.weeks[editingWeekIdx].map((day, idx) => (
            <React.Fragment key={idx}>
              {templateProgram.weeks[editingWeekIdx].length < 7 && (
                <AddButton onClick={() => handleAddDay(idx)} />
              )}
              <DayInfo
                day={day}
                dIdx={idx}
                hasErrors={templateErrors.includes(day.name)}
                onRequestDelete={setDeletingDayIdx}
              />
            </React.Fragment>
          ))}
        </div>
        {templateProgram.weeks[editingWeekIdx].length < 7 && (
          <AddButton
            onClick={() =>
              handleAddDay(templateProgram.weeks[editingWeekIdx].length)
            }
          />
        )}
      </div>
      <DeleteDayDialog
        deletingDayIdx={deletingDayIdx}
        onClose={() => setDeletingDayIdx(undefined)}
      />
    </>
  );
};
