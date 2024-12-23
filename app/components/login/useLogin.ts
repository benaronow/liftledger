import {
  selectCurUser,
  loginUser,
  selectAttemptedLogin,
} from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { User } from "@/types";
import { useEffect } from "react";

export const useLogin = (auth0_email: string) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (auth0_email) dispatch(loginUser(auth0_email));
  }, []);

  const attemptedLogin: boolean = useAppSelector(selectAttemptedLogin);
  const curUser: User | undefined = useAppSelector(selectCurUser);

  return { attemptedLogin, curUser };
};
