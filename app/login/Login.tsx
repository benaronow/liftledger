"use client";

import { ActionButton } from "@/app/components/ActionButton";
import { useRouter } from "next/navigation";
import { BiLogIn } from "react-icons/bi";

export const Login = () => {
  const router = useRouter();

  return (
    <div className="d-flex flex-column h-100 w-100 align-items-center justify-content-center gap-4">
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
          router.push("/auth/login");
        }}
        width="auto"
      />
    </div>
  );
};
