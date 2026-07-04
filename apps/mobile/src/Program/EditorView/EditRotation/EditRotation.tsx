import {
  getNewSetsFromLatest,
  useProgram,
  useCompletedExercises,
  useMe,
  useUpdateUser,
} from "@liftledger/api-client";
import { Session } from "@liftledger/shared";
import { Fragment, useEffect, useState } from "react";
import { View } from "react-native";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { AddRow } from "../../../components/AddRow";
import { AppTextInput, NumberInput } from "../../../components/inputs";
import { SectionCard } from "../../../components/SectionCard";
import { SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";
import { SessionInfo } from "./SessionInfo";
import { DeleteSessionDialog } from "./DeleteSessionDialog";

export const EditRotation = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const {
    templateProgram,
    setTemplateProgram,
    editingRotationIdx,
    templateErrors,
  } = useTemplate();
  const [deletingSessionIdx, setDeletingSessionIdx] = useState<
    number | undefined
  >(undefined);

  const rotation = templateProgram.rotations[editingRotationIdx];

  // Seed the primary gym (and propagate it to the editing rotation's sessions +
  // exercises) from the user's first saved gym when none is set yet.
  useEffect(() => {
    if (templateProgram.primaryGym === undefined && curUser?.gyms?.length) {
      setTemplateProgram({
        ...templateProgram,
        primaryGym: curUser.gyms[0],
        rotations: templateProgram.rotations.map((w, wIdx) =>
          wIdx === editingRotationIdx
            ? w.map((session) => ({
                ...session,
                gym: curUser.gyms[0],
                exercises: session.exercises.map((exercise) => ({
                  ...exercise,
                  gym: curUser.gyms[0],
                })),
              }))
            : w,
        ),
      });
    }
  }, [templateProgram, curUser?.gyms, editingRotationIdx, setTemplateProgram]);

  const setPrimaryGym = (gym: string) => {
    const curRotationIdx = curProgram?.curRotationIdx ?? 0;
    const curSessionIdx = curProgram?.curSessionIdx ?? 0;

    setTemplateProgram({
      ...templateProgram,
      primaryGym: gym,
      rotations: templateProgram.rotations.map((w, wIdx) => {
        if (wIdx < curRotationIdx) return w;

        return w.map((session, dIdx) => {
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
      name: `Session ${rotation.length + 1}`,
      gym: templateProgram.primaryGym || "",
      exercises: [
        {
          name: "",
          equipment: "",
          gym: templateProgram.primaryGym || "",
          sets: [{ reps: null, weight: null, completed: false, note: "" }],
          weightType: curUser?.defaultWeightType ?? "",
        },
      ],
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((w, wIdx) =>
        wIdx === editingRotationIdx ? w.toSpliced(idx, 0, newSession) : w,
      ),
    });
  };

  const handleLengthInput = (length: number | null) => {
    if (length == null) return;
    setTemplateProgram({ ...templateProgram, length });
  };

  const handleRestDaysInput = (restDays: number | null) => {
    if (restDays == null) return;
    setTemplateProgram({ ...templateProgram, restDays });
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
        <NumberInput
          label="Rotations"
          value={templateProgram.length}
          error={templateErrors.program.length}
          onChangeValue={handleLengthInput}
        />
        <NumberInput
          label="Rest Days"
          value={templateProgram.restDays ?? 0}
          onChangeValue={handleRestDaysInput}
        />
        <SearchableSelect
          label="Primary Gym"
          error={templateErrors.program.primaryGym}
          value={templateProgram.primaryGym ?? ""}
          options={curUser?.gyms || []}
          onSelect={setPrimaryGym}
          onAddCustom={handleAddGym}
          canAddCustom
          placeholder="Search or add gym..."
        />
      </SectionCard>

      <View style={{ width: "100%", alignItems: "center" }}>
        {rotation.map((session, idx) => (
          <Fragment key={idx}>
            {rotation.length < 7 && (
              <AddRow
                onPress={() => handleAddSession(idx)}
                disabled={!!curProgram && curProgram.curSessionIdx > idx}
              />
            )}
            <SessionInfo
              session={session}
              dIdx={idx}
              errors={templateErrors.sessions[idx]}
              onRequestDelete={setDeletingSessionIdx}
            />
          </Fragment>
        ))}
        {rotation.length < 7 && (
          <AddRow onPress={() => handleAddSession(rotation.length)} />
        )}
      </View>

      <DeleteSessionDialog
        deletingSessionIdx={deletingSessionIdx}
        onClose={() => setDeletingSessionIdx(undefined)}
      />
    </View>
  );
};
