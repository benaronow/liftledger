import {
  selectCurUser,
  selectAttemptedLogin,
  deleteUser,
  loginUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { User } from "@/types";
import { useEffect } from "react";

export const useLiftLedger = (auth0_email: string) => {
  const dispatch = useAppDispatch();

  const attemptedLogin: boolean = useAppSelector(selectAttemptedLogin);
  const curUser: User | undefined = useAppSelector(selectCurUser);

  useEffect(() => {
    if (auth0_email && !curUser) dispatch(loginUser(auth0_email));
  }, [curUser]);

  const handleDelete = () => {
    dispatch(deleteUser(auth0_email));
  };

  return { attemptedLogin, curUser, handleDelete };
};
