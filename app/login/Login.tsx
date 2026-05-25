"use client";

import { ActionButton } from "@/app/components/ActionButton";
import { useScreenState } from "@/app/layoutProviders/ScreenStateProvider";
import { useRouter } from "next/navigation";
import { BiLogIn } from "react-icons/bi";

export const Login = () => {
  const { toggleScreenState } = useScreenState();
  const router = useRouter();

  return (
    <div
      className="d-flex flex-column w-100 align-items-center"
      style={{
        height: "100dvh",
        padding: "65px 15px 85px",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <span
        className="text-white"
        style={{
          fontFamily: "League+Spartan",
          fontWeight: 900,
          fontSize: "24px",
        }}
      >
        Welcome to LiftLedger!
      </span>
      <ActionButton
        label="Log in"
        icon={<BiLogIn fontSize={24} />}
        onClick={() => {
          toggleScreenState("fetching", true);
          router.push("/auth/login");
        }}
        width="auto"
      />
    </div>
  );
};
