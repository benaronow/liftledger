import { Session } from "@liftledger/shared";
import dayjs, { Dayjs } from "dayjs";
import React, { ChangeEvent, useEffect, useState } from "react";
import { AddButton } from "@/components/AddButton";
import { SessionInfo } from "./SessionInfo";
import {
  getNewSetsFromLatest,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useProgram,
} from "@liftledger/api-client";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useTemplate } from "../../TemplateProvider";
import { LabeledTextInput, LabeledDateInput } from "@/components/inputs";

export const EditRotation = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { templateProgram, setTemplateProgram, editingRotationIdx, templateErrors } =
    useTemplate();
  const [deletingSessionIdx, setDeletingSessionIdx] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (templateProgram.primaryGym === undefined && curUser?.gyms?.length) {
      setTemplateProgram({
        ...templateProgram,
        primaryGym: curUser.gyms[0],
        rotations: templateProgram.rotations.map((rotation, wIdx) =>
          wIdx === editingRotationIdx
            ? rotation.map((session) => ({
                ...session,
                gym: curUser.gyms[0],
                exercises: session.exercises.map((exercise) => ({
                  ...exercise,
                  gym: curUser.gyms[0],
                })),
              }))
            : rotation,
        ),
      });
    }
  }, [templateProgram, curUser?.gyms, editingRotationIdx, setTemplateProgram]);

  const handleProgramNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateProgram({ ...templateProgram, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateProgram({ ...templateProgram, startDate: value.toDate() });
  };

  const setPrimaryGym = (gym: string) => {
    const curRotationIdx = curProgram?.curRotationIdx ?? 0;
    const curSessionIdx = curProgram?.curSessionIdx ?? 0;

    setTemplateProgram({
      ...templateProgram,
      primaryGym: gym,
      rotations: templateProgram.rotations.map((rotation, wIdx) => {
        if (wIdx < curRotationIdx) return rotation;

        return rotation.map((session, dIdx) => {
          if (wIdx === curRotationIdx && dIdx < curSessionIdx) return session;

          const sessionHasCompletedSets = session.exercises.some((ex) =>
            ex.sets.some((s) => s.completed || s.skipped),
          );
          if (sessionHasCompletedSets) return session;

          return {
            ...session,
            gym,
            exercises: session.exercises.map((exercise) => ({
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

  const handleAddSession = (idx: number) => {
    const newSession: Session = {
      name: `Session ${templateProgram.rotations[editingRotationIdx].length + 1}`,
      gym: templateProgram.primaryGym || "",
      exercises: [
        {
          name: "",
          apparatus: "",
          gym: templateProgram.primaryGym || "",
          sets: [
            {
              reps: null,
              weight: null,
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
      rotations: templateProgram.rotations.map((rotation, wIdx) =>
        wIdx === editingRotationIdx ? rotation.toSpliced(idx, 0, newSession) : rotation,
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
            label="Rotations: "
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
          {templateProgram.rotations[editingRotationIdx].map((session, idx) => (
            <React.Fragment key={idx}>
              {templateProgram.rotations[editingRotationIdx].length < 7 && (
                <AddButton onClick={() => handleAddSession(idx)} />
              )}
              <SessionInfo
                session={session}
                dIdx={idx}
                hasErrors={templateErrors.includes(session.name)}
                onRequestDelete={setDeletingSessionIdx}
              />
            </React.Fragment>
          ))}
        </div>
        {templateProgram.rotations[editingRotationIdx].length < 7 && (
          <AddButton
            onClick={() =>
              handleAddSession(templateProgram.rotations[editingRotationIdx].length)
            }
          />
        )}
      </div>
      <DeleteSessionDialog
        deletingSessionIdx={deletingSessionIdx}
        onClose={() => setDeletingSessionIdx(undefined)}
      />
    </>
  );
};
