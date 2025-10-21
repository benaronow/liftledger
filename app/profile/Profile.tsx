"use client";

import { Avatar } from "@mui/material";
import { useEffect } from "react";
import { useUser } from "../providers/UserProvider";
import { useRouter } from "next/navigation";
import { RouteType } from "@/lib/types";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../components/spinner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { PushButton } from "../components/pushButton";

export const Profile = () => {
  const { session, curUser } = useUser();
  const { isFetching, toggleScreenState } = useScreenState();
  const router = useRouter();
  dayjs.extend(utc);

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else if (!curUser) {
      router.push("/create-account");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.History);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div
      className="d-flex flex-column align-items-center w-100"
      style={{
        height: "100dvh",
        padding: "65px 15px 85px",
        overflow: "scroll",
      }}
    >
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
          sx={{ height: "75px", width: "75px", marginRight: "20px" }}
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
          <div
            className="d-flex justify-content-between w-100"
            style={{ fontFamily: "League+Spartan", fontSize: "14px" }}
          >
            <span className="fw-bold" style={{ fontFamily: "League+Spartan" }}>
              Birthday:
            </span>
            <span>
              {curUser
                ? `${dayjs(curUser.birthday).utc().format("MM/DD/YYYY")}`
                : "Unavailable"}
            </span>
          </div>
        </div>
        <PushButton height={40} width={90}>
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
        </PushButton>
      </div>
    </div>
  );
};
