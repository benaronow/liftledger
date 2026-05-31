import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import {
  useMe,
  useStartBlock,
  useUpdateUserBlock,
  useUserBlock,
} from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { useEditBlock } from "./EditBlockProvider";

export const SaveBlockDialog = () => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { data: curBlock } = useUserBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerStartBlock, isMutating: starting } = useStartBlock();
  const { trigger: triggerUpdateUserBlock, isMutating: updating } =
    useUpdateUserBlock();
  const saving = starting || updating;

  const { templateBlock, unsetTemplateBlock, setEditingWeekIdx } =
    useEditBlock();
  const { saveDialogOpen, setSaveDialogOpen } = useEditBlock();

  const handleSave = async () => {
    if (!curUser?._id) return;

    if (curBlock) {
      await triggerUpdateUserBlock({
        userId: curUser._id,
        block: templateBlock,
      });
    } else {
      await triggerStartBlock({ userId: curUser._id, block: templateBlock });
    }

    unsetTemplateBlock();
    setEditingWeekIdx(0);
    navigate("/dashboard");
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setSaveDialogOpen(false),
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

  return (
    <>
      {saveDialogOpen && (
        <ActionDialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          title="Save Block"
          actions={actions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to save this block?
            </span>
            <strong className="text-white text-wrap">
              {curBlock
                ? "This will overwrite your current block."
                : "This will become your active training block."}
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
