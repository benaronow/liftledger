import { Day } from "@/lib/types";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useMemo } from "react";
import { LabeledInput } from "../../components/LabeledInput";
import { AddButton } from "../../components/AddButton";
import { DayInfo } from "./DayInfo";
import { EMPTY_BLOCK, useBlock } from "@/app/providers/BlockProvider";
import { useUser } from "@/app/providers/UserProvider";
import { DeleteDayDialog } from "./DeleteDayDialog";
import { useCompletedExercises } from "@/app/providers/CompletedExercisesProvider";
import { SearchableSelect } from "@/app/components/SearchableSelect";
import { useEditBlock } from "../EditBlockProvider";

export const EditWeek = () => {
  const router = useRouter();
  const { curUser, updateUser } = useUser();
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const { getNewSetsFromLatest } = useCompletedExercises();
  const { templateErrors } = useEditBlock();

  const blockStarted = useMemo(
    () =>
      curBlock?.weeks.some((week) =>
        week.some((day) =>
          day.exercises.some((exercise) =>
            exercise.sets.some((set) => set.completed || set.skipped),
          ),
        ),
      ),
    [curBlock],
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
  }, [templateBlock]);

  useEffect(() => {
    if (curBlock && templateBlock === EMPTY_BLOCK) {
      router.push("/dashboard");
    }
  }, [curBlock, templateBlock]);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({ ...templateBlock, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateBlock({ ...templateBlock, startDate: value.toDate() });
  };

  const setPrimaryGym = (gym: string) => {
    setTemplateBlock({
      ...templateBlock,
      primaryGym: gym,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, idx) =>
              idx >= (curBlock?.curDayIdx ?? 0)
                ? {
                    ...day,
                    gym,
                    exercises: day.exercises.map((exercise) =>
                      exercise.sets.some((s) => s.completed)
                        ? exercise
                        : {
                            ...exercise,
                            gym,
                            sets: getNewSetsFromLatest({
                              ...exercise,
                              gym,
                            }),
                          },
                    ),
                  }
                : day,
            )
          : week,
      ),
    });
  };

  const handleAddGym = async (gym: string) => {
    if (!curUser) return;

    updateUser({
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
          <LabeledInput
            label="Name: "
            textValue={templateBlock.name}
            onChangeText={handleBlockNameInput}
          />
          <LabeledInput
            label="Start: "
            dateValue={dayjs(templateBlock.startDate)}
            onChangeDate={handleDateInput}
          />
          <LabeledInput
            label="Weeks: "
            textValue={templateBlock.length}
            onChangeText={handleLengthInput}
          />
          <SearchableSelect
            label="Primary Gym:"
            value={templateBlock.primaryGym ?? ""}
            options={curUser?.gyms || []}
            onSelect={(gym: string) => setPrimaryGym(gym)}
            onAddCustom={handleAddGym}
            disabled={blockStarted}
            placeholder="Please select a gym"
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
      <DeleteDayDialog />
    </>
  );
};
