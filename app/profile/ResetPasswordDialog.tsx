"use client";

import { useState } from "react";
import { Spinner } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useRequestPasswordReset } from "@liftledger/api-client";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ open, onClose }: Props) => {
  const { trigger: requestPasswordReset, isMutating: sending } =
    useRequestPasswordReset();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setSent(false);
    setError("");
    onClose();
  };

  const handleSend = async () => {
    setError("");
    try {
      await requestPasswordReset();
      setSent(true);
    } catch (e: unknown) {
      const error = (e as AxiosError<{ error?: string }>)?.response?.data
        ?.error;
      setError(error ?? "Failed to send reset email");
    }
  };

  const actions: DialogAction[] = sent
    ? [
        {
          icon: <IoArrowBack fontSize={28} />,
          onClick: handleClose,
          variant: "primaryInverted",
        },
      ]
    : [
        {
          icon: <IoArrowBack fontSize={28} />,
          onClick: handleClose,
          variant: "dangerInverted",
          disabled: sending,
        },
        {
          icon: sending ? (
            <Spinner animation="border" variant="light" />
          ) : (
            <FaPaperPlane style={{ fontSize: "22px" }} />
          ),
          onClick: handleSend,
          variant: "danger",
          disabled: sending,
        },
      ];

  return (
    <ActionDialog
      open={open}
      onClose={handleClose}
      title="Reset Password"
      actions={actions}
      saving={sending}
    >
      <div className="d-flex flex-column">
        {sent ? (
          <strong className="text-white text-wrap">
            A password reset email has been sent. Check your inbox to set a new
            password.
          </strong>
        ) : (
          <>
            <span className="text-white text-wrap mb-3">
              Send a password reset email to your inbox?
            </span>
            <strong className="text-white text-wrap">
              You&apos;ll receive a link to set a new password.
            </strong>
          </>
        )}
        {error && (
          <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
            {error}
          </div>
        )}
      </div>
    </ActionDialog>
  );
};
