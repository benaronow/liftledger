import { deleteUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { Box, Button, Modal } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  modalContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  email: {
    margin: "10px 10px 10px 10px",
  },
  accountButton: {
    margin: "10px 10px 10px 10px",
    border: "solid",
    borderWidth: "1px",
  },
});

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  session: SessionData | null;
}

export const ProfileModal = ({ open, onClose, session }: ProfileModalProps) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const boxStyle = {
    position: "absolute",
    top: "70px",
    right: "10px",
    background: "white",
    outline: 0,
    border: "solid",
    borderColor: "lightgray",
    borderRadius: "25px",
  };

  const auth0_email = session?.user.email || "";
  const handleDelete = () => {
    dispatch(deleteUser(auth0_email));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { invisible: true } }}
    >
      <Box sx={boxStyle}>
        <div className={classes.modalContent}>
          {session ? (
            <>
              <span className={classes.email}>{session?.user.email}</span>
              <Button className={classes.accountButton} href="/auth/logout">
                Log out
              </Button>
              <Button
                className={classes.accountButton}
                href="/auth/logout"
                onClick={handleDelete}
              >
                Delete Account
              </Button>
            </>
          ) : (
            <>
              <Button className={classes.accountButton} href="/auth/login">
                Log in
              </Button>
            </>
          )}
        </div>
      </Box>
    </Modal>
  );
};
