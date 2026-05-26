"use client";

import { User } from "@/lib/types";
import { SessionData } from "@auth0/nextjs-auth0/types";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/config";

export const USER_API_URL = "/api/user";

interface UserContextType {
  session: SessionData | null;
  attemptedLogin: boolean;
  curUser?: User;
  curUserLoading: boolean;
  getUser: (sub: string) => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
}

const defaultUserContext: UserContextType = {
  session: null,
  attemptedLogin: false,
  curUserLoading: true,
  getUser: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  updateEmail: async () => {},
};

export const UserContext = createContext(defaultUserContext);

interface UserProviderProps {
  session: SessionData | null;
}

export const UserProvider = ({
  children,
  session,
}: PropsWithChildren<UserProviderProps>) => {
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  const [curUser, setCurUser] = useState<User>();
  const [curUserLoading, setCurUserLoading] = useState(false);

  const getUser = async (sub: string) => {
    setCurUserLoading(true);
    const res = await api.get(`${USER_API_URL}/${sub}`);
    const result: User = res.data;
    setAttemptedLogin(true);
    if (result) setCurUser(result);
    setCurUserLoading(false);
  };

  useEffect(() => {
    if (session?.user.sub && !curUser) getUser(session.user.sub);
  }, [curUser]);

  const createUser = async (user: Partial<User>) => {
    setCurUserLoading(true);
    const res = await api.post(`${USER_API_URL}`, user);
    const result: User = res.data;
    if (result) setCurUser(result);
    setCurUserLoading(false);
  };

  const updateUser = async (user: User) => {
    setCurUserLoading(true);
    const res = await api.put(`${USER_API_URL}/${user._id}`, user);
    const result: User = res.data;
    if (result) setCurUser(result);
    setCurUserLoading(false);
  };

  const updateEmail = async (email: string) => {
    try {
      const res = await api.patch("/api/auth0", { email });
      const result: User = res.data;
      if (result) setCurUser(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      throw new Error(e?.response?.data?.error ?? "Failed to update email");
    }
  };

  return (
    <UserContext.Provider
      value={{
        session,
        attemptedLogin,
        curUser,
        curUserLoading,
        getUser,
        createUser,
        updateUser,
        updateEmail,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
