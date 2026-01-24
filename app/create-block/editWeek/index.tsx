import { Day } from "@/lib/types";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { LabeledInput } from "../../components/LabeledInput";
import { AddButton } from "../../components/AddButton";
import { DayInfo } from "./DayInfo";
import { EMPTY_BLOCK, useBlock } from "@/app/providers/BlockProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { useUser } from "@/app/providers/UserProvider";
import { ActionButton } from "@/app/components/ActionButton";
import { AddGymDialog } from "@/app/create-block/editWeek/AddGymDialog";
import { GrFormAdd } from "react-icons/gr";

interface EditWeekProps {
  setEditingDay: (day: number) => void;
  errors: string[];
}

export const EditWeek = ({ setEditingDay, errors }: EditWeekProps) => {
  const router = useRouter();
  const { curUser } = useUser();
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx, getNewSetsFromLatest } =
    useBlock();
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const [gymDialogOpen, setGymDialogOpen] = useState<boolean>(false);
  const noGyms = !curUser?.gyms || curUser?.gyms?.length === 0;

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
            : week
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

  const handleChangePrimaryGym = (e: ChangeEvent<HTMLSelectElement>) => {
    setPrimaryGym(e.target.value);
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
        wIdx === editingWeekIdx ? week.toSpliced(idx, 0, newDay) : week
      ),
    });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({
      ...templateBlock,
      length: parseInt(e.target.value) || 0,
    });
  };

  const handleRemoveDay = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingIdx !== undefined
          ? week.toSpliced(deletingIdx, 1)
          : week
      ),
    });
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingIdx(undefined),
      variant: "dangerInverted",
    },
    {
      icon: <FaTrash fontSize={26} />,
      onClick: () => {
        handleRemoveDay();
        setDeletingIdx(undefined);
      },
      variant: "danger",
    },
  ];

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
          <LabeledInput
            label="Primary Gym: "
            textValue={templateBlock.primaryGym ?? "Please add a gym"}
            options={[
              ...(noGyms ? ["Please add a gym"] : []),
              ...(curUser?.gyms || []),
            ]}
            disabled={noGyms}
            onChangeSelect={handleChangePrimaryGym}
            trailing={
              <ActionButton
                icon={<GrFormAdd style={{ fontSize: "50px" }} />}
                onClick={() => setGymDialogOpen(true)}
                width={35}
                className="ms-2"
              ></ActionButton>
            }
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
                setEditingDay={setEditingDay}
                setDeletingIdx={setDeletingIdx}
                hasErrors={errors.includes(day.name)}
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
      <ActionDialog
        open={deletingIdx !== undefined}
        onClose={() => setDeletingIdx(undefined)}
        title={"Delete Day"}
        actions={deleteActions}
      >
        <div className="d-flex flex-column">
          <span className="text-white text-wrap mb-4">
            Are you sure you want to delete this day?
          </span>
          <strong className="text-white text-wrap">
            This action cannot be undone.
          </strong>
        </div>
      </ActionDialog>
      <AddGymDialog
        open={gymDialogOpen}
        onClose={() => setGymDialogOpen(false)}
        onAdd={(gym: string) => setPrimaryGym(gym)}
      />
    </>
  );
};
