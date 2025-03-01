import { keyframes } from "tss-react";
import { makeStyles } from "tss-react/mui";

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
    height: "calc(100dvh - 120px)",
    alignItems: "center",
  },
  logo: {
    animation: `${spin} 1s infinite ease`,
  },
});