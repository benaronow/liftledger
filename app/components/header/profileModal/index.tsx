import { deleteUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { Box, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  modalContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  email: {
    marginBottom: "10px",
  },
  accountButton: {
    border: "none",
    background: "transparent",
    marginBottom: "10px",
    fontFamily: "Gabarito",
    fontSize: "16px",
  },
  deleteButton: {
    color: "red",
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
  session: SessionData | null;
}

export const ProfileModal = ({ open, onClose, session }: ProfileModalProps) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const auth0_email = session?.user.email || "";

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
    dispatch(deleteUser(auth0_email));
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
