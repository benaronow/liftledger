"use client";

import { useAppDispatch } from "@/lib/hooks";
import { createUser, getAllUsers, getUser } from "@/lib/features/user/userSlice";

export const Counter = () => {
  const dispatch = useAppDispatch();

  const createUserClick = () => {
    dispatch(
      createUser({ username: "JojiJohn", password: "321", favExercise: "deadlifts" })
    );
  };

  const getUserClick = () => {
    dispatch(getUser("JojiJohn"));
  };

  const getAllUsersClick = () => {
    dispatch(getAllUsers());
  }

  return (
    <div>
      <button onClick={createUserClick}>Create User</button>
      <button onClick={getUserClick}>Get User</button>
      <button onClick={getAllUsersClick}>Get All Users</button>
    </div>
  );
};
