import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import {
  useMe,
  useStartProgram,
  useUpdateUserProgram,
  useProgram,
} from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SaveProgramDialog = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerStartProgram, isMutating: starting } = useStartProgram();
  const { trigger: triggerUpdateUserProgram, isMutating: updating } =
    useUpdateUserProgram();
  const saving = starting || updating;

  const { templateProgram, unsetTemplateProgram, setEditingRotationIdx } =
    useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;

    if (curProgram) {
      await triggerUpdateUserProgram({
        userId: curUser._id,
        program: templateProgram,
      });
    } else {
      await triggerStartProgram({ userId: curUser._id, program: templateProgram });
    }

    unsetTemplateProgram();
    setEditingRotationIdx(0);
    navigate("/dashboard");
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "primaryInverted",
      disabled: saving,
    },
    {
      icon: saving ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave style={{ fontSize: "22px" }} />
      ),
      onClick: handleSave,
      variant: "primary",
      disabled: saving,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Save Program"
      actions={actions}
    >
      <div className="d-flex flex-column">
        <span className="text-white text-wrap mb-4">
          Are you sure you want to save this program?
        </span>
        <strong className="text-white text-wrap">
          {curProgram
            ? "This will overwrite your current program."
            : "This will become your active training program."}
        </strong>
      </div>
    </ActionDialog>
  );
};
