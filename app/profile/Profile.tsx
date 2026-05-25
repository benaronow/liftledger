"use client";

import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { useRouter } from "next/navigation";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { ActionButton } from "@/app/components/ActionButton";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { COLORS } from "@/lib/colors";
import { FaPencilAlt, FaSave, FaTrashAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";
import api from "@/lib/config";

const inputStyle = (editing: boolean): React.CSSProperties => ({
  background: "transparent",
  border: editing ? "1px solid #58585b" : "none",
  outline: "none",
  fontSize: "14px",
  fontFamily: "League+Spartan",
  color: "white",
  padding: editing ? "2px 6px" : "2px 0",
  borderRadius: "4px",
  minWidth: 0,
  flex: 1,
});

export const Profile = () => {
  const { session, curUser, updateUser } = useUser();
  const router = useRouter();

  const isDbUser = session?.user.sub?.startsWith("auth0|") ?? false;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [editingFirst, setEditingFirst] = useState(false);
  const [editingLast, setEditingLast] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (curUser) {
      setFirstName(curUser.firstName ?? "");
      setLastName(curUser.lastName ?? "");
      setEmail(curUser.email);
    }
  }, [curUser?._id]);

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  const handleSaveFirstName = async () => {
    if (!curUser) return;
    await updateUser({ ...curUser, firstName });
    setEditingFirst(false);
  };

  const handleSaveLastName = async () => {
    if (!curUser) return;
    await updateUser({ ...curUser, lastName });
    setEditingLast(false);
  };

  const handleSaveEmail = async () => {
    if (!curUser) return;
    setEmailError("");
    try {
      await api.patch("/api/auth0", { email, dbUserId: curUser._id });
      setEditingEmail(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setEmailError(e?.response?.data?.error ?? "Failed to update email");
    }
  };

  const handlePasswordReset = async () => {
    await api.post("/api/auth0", {});
    setResetSent(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await api.delete("/api/auth0");
      router.push("/auth/logout");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setDeleteError(e?.response?.data?.error ?? "Failed to delete account");
      setDeleting(false);
    }
  };

  const deleteDialogActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeleteDialogOpen(false),
      variant: "dangerInverted",
      disabled: deleting,
    },
    {
      icon: deleting ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaTrashAlt style={{ fontSize: "24px" }} />
      ),
      onClick: handleDeleteAccount,
      variant: "danger",
      disabled: deleting,
    },
  ];

  if (!curUser) return <LogoSpinner />;

  const firstNameEdited = firstName !== (curUser.firstName ?? "");
  const lastNameEdited = lastName !== (curUser.lastName ?? "");
  const emailEdited = email !== curUser.email;

  return (
    <div className="d-flex flex-column align-items-center h-100 w-100 overflow-scroll">
      <div
        className="d-flex flex-column align-items-center text-white w-100"
        style={{
          fontFamily: "League+Spartan",
          fontSize: "14px",
          marginBottom: "10px",
          borderRadius: "5px",
        }}
      >
        <Avatar
          sx={{ height: "75px", width: "75px" }}
          src={session?.user.picture}
        />
        <div
          className="d-flex flex-column w-100"
          style={{
            background: "#131314",
            margin: "15px 0px",
            borderRadius: "5px",
            padding: "10px",
            gap: "10px",
            border: "solid 5px #58585b",
            boxShadow: "0px 5px 10px #131314",
          }}
        >
          <div
            className="d-flex align-items-center w-100"
            style={{ gap: "8px" }}
          >
            <span className="fw-bold text-nowrap" style={{ minWidth: "90px" }}>
              First Name:
            </span>
            <input
              style={inputStyle(editingFirst)}
              value={firstName}
              readOnly={!editingFirst}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <ActionButton
              icon={
                editingFirst && firstNameEdited ? (
                  <FaSave size={14} />
                ) : (
                  <FaPencilAlt size={14} />
                )
              }
              height={28}
              width={28}
              onClick={() => {
                if (editingFirst && firstNameEdited) {
                  handleSaveFirstName();
                } else {
                  setEditingFirst((prev) => !prev);
                }
              }}
            />
          </div>
          <div
            className="d-flex align-items-center w-100"
            style={{ gap: "8px" }}
          >
            <span className="fw-bold text-nowrap" style={{ minWidth: "90px" }}>
              Last Name:
            </span>
            <input
              style={inputStyle(editingLast)}
              value={lastName}
              readOnly={!editingLast}
              onChange={(e) => setLastName(e.target.value)}
            />
            <ActionButton
              icon={
                editingLast && lastNameEdited ? (
                  <FaSave size={14} />
                ) : (
                  <FaPencilAlt size={14} />
                )
              }
              height={28}
              width={28}
              onClick={() => {
                if (editingLast && lastNameEdited) {
                  handleSaveLastName();
                } else {
                  setEditingLast((prev) => !prev);
                }
              }}
            />
          </div>
          <div
            className="d-flex align-items-center w-100"
            style={{ gap: "8px" }}
          >
            <span className="fw-bold text-nowrap" style={{ minWidth: "90px" }}>
              Email:
            </span>
            <input
              style={inputStyle(editingEmail && isDbUser)}
              value={email}
              readOnly={!editingEmail || !isDbUser}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isDbUser && (
              <ActionButton
                icon={
                  editingEmail && emailEdited ? (
                    <FaSave size={14} />
                  ) : (
                    <FaPencilAlt size={14} />
                  )
                }
                height={28}
                width={28}
                onClick={() => {
                  if (editingEmail && emailEdited) {
                    handleSaveEmail();
                  } else {
                    setEmailError("");
                    setEditingEmail((prev) => !prev);
                  }
                }}
              />
            )}
          </div>
          {emailError && (
            <div className="text-danger" style={{ fontSize: "13px" }}>
              {emailError}
            </div>
          )}
        </div>
        <div
          className="d-flex flex-column align-items-center w-100"
          style={{ gap: "10px" }}
        >
          {isDbUser && (
            <button
              className="border border-0 px-3 py-2 rounded w-100"
              style={{
                background: resetSent ? COLORS.primaryDisabled : "#58585b",
              }}
              disabled={resetSent}
              onClick={handlePasswordReset}
            >
              <span
                className="text-white"
                style={{
                  fontFamily: "League+Spartan",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {resetSent
                  ? "Password reset email sent!"
                  : "Send Password Reset Email"}
              </span>
            </button>
          )}
          <button
            className="border border-0 px-3 py-2 rounded w-100"
            style={{ background: COLORS.primary }}
            onClick={handleLogout}
          >
            <span
              className="text-white"
              style={{
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Log Out
            </span>
          </button>
          <button
            className="border border-0 px-3 py-2 rounded w-100"
            style={{ background: COLORS.danger }}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <span
              className="text-white"
              style={{
                fontFamily: "League+Spartan",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Delete Account
            </span>
          </button>
        </div>
      </div>
      <ActionDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Account"
        actions={deleteDialogActions}
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
          {deleteError && (
            <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
              {deleteError}
            </div>
          )}
        </div>
      </ActionDialog>
    </div>
  );
};
