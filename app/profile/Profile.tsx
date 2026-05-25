"use client";

import { Avatar } from "@mui/material";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { useRouter } from "next/navigation";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { COLORS } from "@/lib/colors";

export const Profile = () => {
  const { session, curUser } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  if (!curUser) return <LogoSpinner />;

  return (
    <div className="d-flex flex-column align-items-center h-100 w-100 overflow-scroll">
      <div
        className="d-flex flex-column align-items-center text-white text-nowrap w-100"
        style={{
          fontFamily: "League+Spartan",
          fontSize: "14px",
          marginBottom: "10px",
          borderRadius: "5px",
        }}
      >
        <Avatar
          sx={{ height: "75px", width: "75px" }}
          src={session?.user.picture}
        />
        <div
          className="d-flex flex-column w-100"
          style={{
            justifyContent: "space-between",
            background: "#131314",
            margin: "15px 0px",
            borderRadius: "5px",
            padding: "10px",
            gap: "10px",
            border: "solid 5px #58585b",
            boxShadow: "0px 5px 10px #131314",
          }}
        >
          <div
            className="d-flex justify-content-between w-100"
            style={{ fontFamily: "League+Spartan", fontSize: "14px" }}
          >
            <span className="fw-bold" style={{ fontFamily: "League+Spartan" }}>
              Name:
            </span>
            <span>
              {curUser
                ? `${curUser?.firstName} ${curUser?.lastName}`
                : "Unavailable"}
            </span>
          </div>
          <div
            className="d-flex justify-content-between w-100"
            style={{ fontFamily: "League+Spartan", fontSize: "14px" }}
          >
            <span className="fw-bold" style={{ fontFamily: "League+Spartan" }}>
              Email:
            </span>
            <span>{curUser ? curUser.email : "Unavailable"}</span>
          </div>
        </div>
        <button
          className="border border-0 px-3 py-2 rounded"
          style={{ background: COLORS.primary }}
        >
          <span
            className="text-white"
            style={{
              fontFamily: "League+Spartan",
              fontSize: "16px",
              fontWeight: 600,
            }}
            onClick={handleLogout}
          >
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
};
