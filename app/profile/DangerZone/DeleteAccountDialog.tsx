"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import api from "@/lib/config";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog = ({ open, onClose }: Props) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await api.delete("/api/auth0");
      router.push("/auth/logout");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to delete account");
      setDeleting(false);
    }
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "dangerInverted",
      disabled: deleting,
    },
    {
      icon: deleting ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaTrash style={{ fontSize: "24px" }} />
      ),
      onClick: handleDelete,
      variant: "danger",
      disabled: deleting,
    },
  ];

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Delete Account"
      actions={actions}
      saving={deleting}
    >
      <div className="d-flex flex-column">
        <span className="text-white text-wrap mb-3">
          Are you sure you want to delete your account?
        </span>
        <strong className="text-white text-wrap">
          This action is permanent and cannot be undone. All your data will be
          lost.
        </strong>
        {error && (
          <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
            {error}
          </div>
        )}
      </div>
    </ActionDialog>
  );
};
