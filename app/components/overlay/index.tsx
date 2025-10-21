"use client";

import { useScreenState } from "@/app/providers/ScreenStateProvider";

export const Overlay = () => {
  const { overlayOn, toggleScreenState } = useScreenState();

  return (
    <div
      className="position-absolute top-0 start-0 w-100"
      style={{
        height: "calc(100dvh - 50px)",
        background: "black",
        opacity: overlayOn ? 0.4 : 0,
        transition: "opacity 0.25s linear",
        zIndex: overlayOn ? 1 : -1,
      }}
      onClick={() => toggleScreenState("overlay", false)}
    />
  );
};
