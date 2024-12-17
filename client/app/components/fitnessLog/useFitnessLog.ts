import {
  getAllUsers,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect } from "react";
import { socket } from "@/socket";

export const useFitnessLog = () => {
  const dispatch = useAppDispatch();
  const curUser = useAppSelector(selectCurUser);

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  useEffect(() => {
    const handleUsersUpdate = () => {
      dispatch(getAllUsers());
    };

    socket.on("usersUpdate", handleUsersUpdate);
    return () => {
      socket.off("usersUpdate", handleUsersUpdate);
    };
  }, [socket]);

  return { curUser };
};
