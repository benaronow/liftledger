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
  useBlock,
} from "@liftledger/api-client";
import { DeleteDayDialog } from "./DeleteDayDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useTemplate } from "../../TemplateProvider";
import { LabeledTextInput, LabeledDateInput } from "@/components/inputs";

export const EditWeek = () => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { templateBlock, setTemplateBlock, editingWeekIdx, templateErrors } =
    useTemplate();
  const [deletingDayIdx, setDeletingDayIdx] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (templateBlock.primaryGym === undefined && curUser?.gyms?.length) {
      setTemplateBlock({
        ...templateBlock,
        primaryGym: curUser.gyms[0],
        weeks: templateBlock.weeks.map((week, wIdx) =>
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
  }, [templateBlock, curUser?.gyms, editingWeekIdx, setTemplateBlock]);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({ ...templateBlock, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateBlock({ ...templateBlock, startDate: value.toDate() });
  };

  const setPrimaryGym = (gym: string) => {
    const curWeekIdx = curBlock?.curWeekIdx ?? 0;
    const curDayIdx = curBlock?.curDayIdx ?? 0;

    setTemplateBlock({
      ...templateBlock,
      primaryGym: gym,
      weeks: templateBlock.weeks.map((week, wIdx) => {
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
      name: `Day ${templateBlock.weeks[editingWeekIdx].length + 1}`,
      gym: templateBlock.primaryGym || "",
      exercises: [
        {
          name: "",
          apparatus: "",
          gym: templateBlock.primaryGym || "",
          sets: [
            {
              reps: 0,
              weight: 0,
              completed: false,
              note: "",
            },
          ],
          weightType: curBlock ? "lbs" : "",
        },
      ],
      completedDate: undefined,
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx ? week.toSpliced(idx, 0, newDay) : week,
      ),
    });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({
      ...templateBlock,
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
            value={templateBlock.name}
            onChange={handleBlockNameInput}
            placeholder="Enter block name..."
          />
          <LabeledDateInput
            label="Start: "
            value={dayjs(templateBlock.startDate)}
            onChange={handleDateInput}
          />
          <LabeledTextInput
            label="Weeks: "
            value={templateBlock.length}
            onChange={handleLengthInput}
          />
          <SearchableSelect
            label="Primary Gym:"
            value={templateBlock.primaryGym ?? ""}
            options={curUser?.gyms || []}
            onSelect={(gym: string) => setPrimaryGym(gym)}
            onAddCustom={handleAddGym}
            canAddCustom
            placeholder="Enter gym..."
          />
        </div>
        <div className="d-flex flex-column align-items-center gap-2 w-100">
          {templateBlock.weeks[editingWeekIdx].map((day, idx) => (
            <React.Fragment key={idx}>
              {templateBlock.weeks[editingWeekIdx].length < 7 && (
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
        {templateBlock.weeks[editingWeekIdx].length < 7 && (
          <AddButton
            onClick={() =>
              handleAddDay(templateBlock.weeks[editingWeekIdx].length)
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
