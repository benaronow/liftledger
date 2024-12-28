"use client";

import { SessionData } from "@auth0/nextjs-auth0/server";
import { useDashboard } from "./useDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@mui/material";

interface DashboardProps {
  session: SessionData | null;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const router = useRouter();
  const auth0_email = session?.user.email || "";
  const { attemptedLogin, curUser } = useDashboard(auth0_email);

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  if (!session) return <span>You are not logged in</span>;

  const handleCreatePlanClick = () => {
    router.push("/create-plan");
  };

  return (
    <>
      <Button onClick={handleCreatePlanClick}> Create Plan</Button>
    </>
  );
};
