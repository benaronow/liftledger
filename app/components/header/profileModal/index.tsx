import { deleteUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Box, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { makeStyles } from "tss-react/mui";
import { LoginContext } from "../../providers/loginContext";

const useStyles = makeStyles()({
  modalContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  email: {
    marginBottom: "10px",
    fontFamily: "Gabarito",
    fontSize: "16px",
  },
  accountButton: {
    border: "none",
    background: "transparent",
    marginBottom: "10px",
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#0096FF",
  },
  deleteButton: {
    color: "#ff0000",
  },
  divider: {
    width: "100%",
    height: "1.5px",
    background: "gray",
    marginBottom: "10px",
  },
});

const boxStyle = {
  position: "absolute",
  top: "50%",
  right: "50%",
  transform: "translate(50%, -50%)",
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderRadius: "10px",
  padding: "10px 10px 00px 10px",
};

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { classes } = useStyles();
  const { session } = useContext(LoginContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/auth/login`);
  };

  const handleProfile = () => {
    onClose();
    router.push(`/profile`);
  };

  const handleLogout = () => {
    router.push(`/auth/logout`);
  };

  const handleDelete = () => {
    dispatch(deleteUser(session?.user.email || ""));
    handleLogout();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={boxStyle}>
        <div className={classes.modalContent}>
          {session ? (
            <>
              <span className={classes.email}>{session?.user.email}</span>
              <div className={classes.divider}></div>
              <button className={classes.accountButton} onClick={handleProfile}>
                My Profile
              </button>
              <button className={classes.accountButton} onClick={handleLogout}>
                Log out
              </button>
              <button
                className={`${classes.accountButton} ${classes.deleteButton}`}
                onClick={handleDelete}
              >
                Delete Account
              </button>
            </>
          ) : (
            <>
              <button className={classes.accountButton} onClick={handleLogin}>
                Log in
              </button>
            </>
          )}
        </div>
      </Box>
    </Modal>
  );
};
