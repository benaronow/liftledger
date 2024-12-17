import {
  getAllUsers,
  selectCurUser,
  selectUsers,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { User } from "@/types";
import { useEffect } from "react";

export const useFitnessLog = () => {
  const dispatch = useAppDispatch();
  const curUser = useAppSelector(selectCurUser);
  const users: User[] = useAppSelector(selectUsers);

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  return { curUser, users };
};
