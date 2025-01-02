import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import { makeStyles } from "tss-react/mui";
import Image from "next/image";
import { keyframes } from "tss-react";

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
  const { session, attemptedLogin, curUser } = useContext(LoginContext);

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
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
