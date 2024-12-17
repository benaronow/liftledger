"use client";

import {
  clearUser,
  createUser,
  deleteUser,
  getAllUsers,
  setUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { ChangeEvent, useEffect, useState } from "react";
import { useFitnessLog } from "./useFitnessLog";
import { Button, Input, styled } from "@mui/material";

const UserInput = styled(Input)({
  border: "solid",
  borderWidth: "1px",
  borderRadius: "5px",
  marginBottom: "5px",
});

const UserButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

export const FitnessLog = () => {
  const { curUser, users } = useFitnessLog();

  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [favExercise, setFavExercise] = useState("");
  const [removeUsername, setRemoveUsername] = useState("");
  const [loginUsername, setLoginUsername] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  const handleAddUser = () => {
    dispatch(createUser({ username, password, favExercise }));
    setUsername("");
    setPassword("");
    setFavExercise("");
  };

  const handleRemoveUser = () => {
    dispatch(deleteUser(removeUsername));
    setRemoveUsername("");
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleFavExerciseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFavExercise(e.target.value);
  };

  const handleRemoveUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRemoveUsername(e.target.value);
  };

  const handleLoginUser = () => {
    dispatch(setUser(loginUsername));
    setLoginUsername("");
  };

  const handleLoginUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginUsername(e.target.value);
  };

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const LoginButton = () => {
    return (
      <a className="button__login" href="/api/auth/login">
        Log In
      </a>
    );
  };

  return (
    <>
      <LoginButton />
      <UserInput
        value={loginUsername}
        onChange={handleLoginUsernameChange}
      ></UserInput>
      <UserButton onClick={handleLoginUser}>Login User</UserButton>
      <UserButton onClick={handleLogout}>Logout</UserButton>
      <span>User:</span>
      {curUser ? (
        <>
          <span>{`Username: ${curUser?.username || "None"}`}</span>
          <span>{`Favorite Exercise: ${curUser?.favExercise || "None"}`}</span>
        </>
      ) : (
        <span>Not signed in</span>
      )}
      <br />
      <UserInput value={username} onChange={handleUsernameChange}></UserInput>
      <UserInput value={password} onChange={handlePasswordChange}></UserInput>
      <UserInput
        value={favExercise}
        onChange={handleFavExerciseChange}
      ></UserInput>
      <UserButton onClick={handleAddUser}>Add User</UserButton>
      <br />
      <UserInput
        value={removeUsername}
        onChange={handleRemoveUsernameChange}
      ></UserInput>
      <UserButton onClick={handleRemoveUser}>Remove User</UserButton>
      <br />
      <span>Users:</span>
      <ol>
        {users.map((user, idx) => (
          <li key={idx}>{user.username}</li>
        ))}
      </ol>
    </>
  );
};
