import {
  getAllUsers,
  selectCurUser,
  loginUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { User } from "@/types";
import { useEffect } from "react";

export const useFitnessLog = (auth0_name: string) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (auth0_name) dispatch(loginUser(auth0_name));
    dispatch(getAllUsers());
  }, []);

  const curUser: User | undefined = useAppSelector(selectCurUser);

  return { curUser };
};
