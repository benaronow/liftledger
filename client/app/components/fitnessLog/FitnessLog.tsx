import {
  createUser,
  deleteUser,
  selectUsers,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { FitnessLogSocket, User } from "@/types";
import { ChangeEvent, useState } from "react";
import { useFitnessLog } from "./useFitnessLog";
import { Button, Input, styled } from "@mui/material";

const UserInput = styled(Input)({
  border: 'solid',
  borderWidth: '1px',
  borderRadius: '5px',
  marginBottom: '5px',
});

const UserButton = styled(Button)({
  border: 'solid',
  borderWidth: '1px',
});

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
      <UserInput value={username} onChange={handleUsernameChange}></UserInput>
      <UserInput value={password} onChange={handlePasswordChange}></UserInput>
      <UserInput value={favExercise} onChange={handleFavExerciseChange}></UserInput>
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
