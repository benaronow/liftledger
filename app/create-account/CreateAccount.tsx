"use client";

import { RouteType, User } from "@/lib/types";
import { Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useUser } from "../providers/UserProvider";
import { Spinner } from "../components/spinner";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
// styles moved inline with Bootstrap utilities where applicable

export const CreateAccount = () => {
  const router = useRouter();
  const { isFetching, toggleScreenState } = useScreenState();
  const { session, attemptedLogin, curUser, createUser } = useUser();

  useEffect(() => {
    router.prefetch(RouteType.Home);
  }, []);

  useEffect(() => {
    if (!session || (attemptedLogin && curUser)) router.push("/dashboard");
  }, [attemptedLogin]);

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    birthday: new Date(),
  });
  const entryNames = ["First Name", "Last Name", "Birthday"];

  const handleDateInput = (value: Dayjs | null) => {
    if (value) setInput({ ...input, birthday: value.toDate() });
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === "First Name")
      setInput({ ...input, firstName: e.target.value });
    if (type === "Last Name") setInput({ ...input, lastName: e.target.value });
    if (type === "Birthday")
      setInput({ ...input, birthday: new Date(e.target.value) });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: Partial<User> = {
      ...input,
      email: session?.user.email || "",
    };
    await createUser(user);
    if (curUser) router.push("/dashboard");
  };

  if (!attemptedLogin || isFetching) return <Spinner />;

  return (
    <div
      className="d-flex flex-column align-items-center w-100 overflow-auto"
      style={{ height: "100dvh", padding: "65px 15px 85px" }}
    >
      <div
        className="w-100 rounded"
        style={{ background: "#58585b", padding: "10px 10px 0px" }}
      >
        <div className="d-flex w-100 justify-content-center">
          <span
            className="text-white fw-bold"
            style={{
              fontFamily: "League+Spartan",
              fontSize: "22px",
              marginBottom: "10px",
            }}
          >
            Start your lifting journey!
          </span>
        </div>
        <form
          className="d-flex flex-column text-white w-100 justify-content-center align-items-center rounded text-nowrap small"
          style={{
            background: "#3a3a3d",
            fontFamily: "League+Spartan",
            padding: "10px",
            marginBottom: "10px",
          }}
          id="create-account-form"
          onSubmit={handleSubmit}
        >
          {Object.values(input).map((entry, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center w-100 justify-content-start"
              style={{ marginBottom: "10px" }}
            >
              <span
                className="fw-semibold"
                style={{
                  fontFamily: "League+Spartan",
                  width: "60%",
                  fontSize: "16px",
                }}
              >{`${entryNames[idx]}: `}</span>
              {entryNames[idx] === "Birthday" ? (
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        ml: "5px",
                        "& .MuiInputBase-input": {
                          paddingLeft: 0,
                          fontSize: "16px",
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "5px",
                          background: "white",
                          "& fieldset": { borderColor: "gray" },
                        },
                      },
                    },
                  }}
                  onChange={(value: Dayjs | null) => handleDateInput(value)}
                />
              ) : (
                <Input
                  sx={{
                    border: "1px solid gray",
                    borderRadius: "5px",
                    marginLeft: "5px",
                    paddingLeft: "5px",
                    fontSize: "16px",
                    background: "white",
                  }}
                  className="w-100"
                  value={entry}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInput(e, entryNames[idx])
                  }
                ></Input>
              )}
            </div>
          ))}
        </form>
        <div
          className="d-flex w-100 justify-content-around"
          style={{ marginBottom: "10px" }}
        >
          <div style={{ width: "100%", height: "35px" }}>
            <div
              style={{
                width: "100%",
                height: "30px",
                border: "none",
                color: "white",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "5px 0 0 5px",
                background: "#004c81",
                transform: "translateY(5px)",
              }}
            />
            <button
              className="border-0 text-white"
              style={{
                width: "100%",
                height: "30px",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "5px 0 0 5px",
                background: "#0096FF",
                transform: "translateY(-30px)",
                transition: "transform 0.1s",
              }}
              form="create-account-form"
              type="submit"
            >
              Create Account
            </button>
          </div>
          <div className="w-100" style={{ height: "35px" }}>
            <div
              className="w-100 border border-0 text-white"
              style={{
                height: "30px",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "0 5px 5px 0",
                background: "#830000",
                transform: "translateY(5px)",
              }}
            />
            <button
              className="border border-0 text-white w-100"
              style={{
                height: "30px",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "0 5px 5px 0",
                background: "red",
                transform: "translateY(-30px)",
                transition: "transform 0.1s",
              }}
              onClick={() => {
                toggleScreenState("fetching", true);
                router.push("/auth/logout");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
