import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import { makeStyles } from "tss-react/mui";
import Image from "next/image";
import { keyframes } from "tss-react";
import { useAppDispatch } from "@/lib/hooks";
import { setMessageOpen } from "@/lib/features/user/userSlice";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { useTheme } from "@mui/material";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "calc(100dvh - 90px)",
    alignItems: "center",
  },
  logo: {
    animation: `${spin} 1s infinite ease`,
  },
});

export const LiftLedger = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
    if (
      typeof window !== "undefined" &&
      innerWidth &&
      innerWidth < theme.breakpoints.values["sm"]
    ) {
      dispatch(
        setMessageOpen(!window.matchMedia("(display-mode: standalone)").matches)
      );
    }
  }, [attemptedLogin]);

  return (
    <div className={classes.container}>
      <Image
        className={classes.logo}
        src="/icon.png"
        alt="Description of image"
        height={50}
        width={50}
      />
    </div>
  );
};
