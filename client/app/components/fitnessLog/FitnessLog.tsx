import {
  createUser,
  deleteUser,
  selectUsers,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { FitnessLogSocket, User } from "@/types";
import { ChangeEvent, useState } from "react";
import { useFitnessLog } from "./useFitnessLog";

export const FitnessLog = ({ socket }: { socket: FitnessLogSocket | null }) => {
  const { curUser } = useFitnessLog(socket);

  const dispatch = useAppDispatch();
  const users: User[] = useAppSelector(selectUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [favExercise, setFavExercise] = useState("");
  const [removeUsername, setRemoveUsername] = useState("");

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

  return (
    <>
      <input value={username} onChange={handleUsernameChange}></input>
      <input value={password} onChange={handlePasswordChange}></input>
      <input value={favExercise} onChange={handleFavExerciseChange}></input>
      <button onClick={handleAddUser}>Add User</button>
      <br />
      <input
        value={removeUsername}
        onChange={handleRemoveUsernameChange}
      ></input>
      <button onClick={handleRemoveUser}>Remove User</button>
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
