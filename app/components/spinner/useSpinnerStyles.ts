import { keyframes } from "tss-react";
import { makeStyles } from "tss-react/mui";

const appear = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const useSpinnerStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100dvh",
    alignItems: "center",
    paddingBottom: "10px",
  },
  logo: {
    opacity: 0,
    animation: `${spin} 1s infinite ease, ${appear} 1s forwards`,
  },
});
