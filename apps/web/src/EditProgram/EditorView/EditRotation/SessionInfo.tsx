import { Session } from "@liftledger/shared";
import { MdArrowBackIosNew, MdControlPointDuplicate } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useMe, useProgram } from "@liftledger/api-client";
import { Info, InfoAction } from "../Info";
import { useMemo } from "react";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  session: Session;
  dIdx: number;
  hasErrors: boolean;
  onRequestDelete: (dIdx: number) => void;
}

export const SessionInfo = ({ session, dIdx, hasErrors, onRequestDelete }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingRotationIdx,
    setEditingSessionIdx,
  } = useTemplate();

  const handleMoveSession = (session: Session, sessionIdx: number, type: "up" | "down") => {
    if ((sessionIdx !== 0 || type !== "up") && (sessionIdx !== 6 || type !== "down")) {
      setTemplateProgram({
        ...templateProgram,
        rotations: templateProgram.rotations.map((rotation, idx) =>
          idx === editingRotationIdx
            ? rotation
                .toSpliced(sessionIdx, 1)
                .toSpliced(type === "up" ? sessionIdx - 1 : sessionIdx + 1, 0, session)
            : rotation,
        ),
      });
    }
  };

  const handleDuplicateSession = (sessionIdx: number) => {
    const session: Session = {
      ...templateProgram.rotations[templateProgram.rotations.length - 1][sessionIdx],
      name: `${templateProgram.rotations[0][sessionIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, idx) =>
        idx === editingRotationIdx ? rotation.toSpliced(sessionIdx + 1, 0, session) : rotation,
      ),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <MdArrowBackIosNew size={24} style={{ transform: "rotate(90deg)" }} />
      ),
      disabled: dIdx === curProgram?.curSessionIdx || dIdx === 0,
      onClick: () => handleMoveSession(session, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: (
        <MdArrowBackIosNew size={24} style={{ transform: "rotate(270deg)" }} />
      ),
      disabled: dIdx === templateProgram.rotations[editingRotationIdx].length - 1,
      onClick: () => handleMoveSession(session, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: (
        <BiSolidEdit style={{ transform: "rotate(90deg)", fontSize: "22px" }} />
      ),
      onClick: () => setEditingSessionIdx(dIdx),
      variant: "primary",
    },
    {
      icon: <MdControlPointDuplicate size={24} />,
      disabled: templateProgram.rotations[editingRotationIdx].length > 6,
      onClick: () => handleDuplicateSession(dIdx),
      variant: "primary",
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled: templateProgram.rotations[editingRotationIdx].length === 1,
      onClick: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const disabledMessage = useMemo(() => {
    const isDisabled = curProgram ? curProgram?.curSessionIdx > dIdx : false;
    return isDisabled
      ? "Session complete, cannot be edited or moved until next rotation."
      : "";
  }, [curProgram, dIdx]);

  return (
    <Info
      title={`Session ${dIdx + 1}`}
      actions={infoActions}
      disabledMessage={disabledMessage}
    >
      <strong className="text-white" style={{ fontSize: "14px" }}>
        {`Name: ${session.name} [${session.exercises.reduce(
          (acc, cur) =>
            acc + (cur.addedOn ? 0 : cur.sets.filter((s) => !s.addedOn).length),
          0,
        )}]`}
      </strong>
      {templateProgram.rotations[editingRotationIdx][dIdx].exercises.some(
        (e) => e.name && e.apparatus && e.sets.length,
      ) &&
        templateProgram.rotations[editingRotationIdx][dIdx].exercises
          .filter((ex) => !ex.addedOn)
          .map((ex, i) => (
            <span
              className="text-white"
              style={{ fontSize: "14px" }}
              key={ex._id}
            >{`${i + 1}. ${ex.name} [${
              ex.sets.filter((s) => !s.addedOn).length
            }]`}</span>
          ))}
      {hasErrors && (
        <strong className="text-danger" style={{ fontSize: "14px" }}>
          Must add at least one exercise.
        </strong>
      )}
    </Info>
  );
};
