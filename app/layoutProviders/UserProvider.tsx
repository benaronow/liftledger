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
  getUser: (email: string) => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
}

const defaultUserContext: UserContextType = {
  session: null,
  attemptedLogin: false,
  curUserLoading: true,
  getUser: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
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

  const getUser = async (email: string) => {
    setCurUserLoading(true);
    const res = await api.get(`${USER_API_URL}/${email}`);
    const result: User = res.data;
    setAttemptedLogin(true);
    if (result) setCurUser(result);
    setCurUserLoading(false);
  };

  useEffect(() => {
    if (session?.user.email && !curUser) getUser(session.user.email);
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

  const deleteUser = async (uid: string) => {
    setCurUserLoading(true);
    const res = await api.delete(`${USER_API_URL}/${uid}`);
    const result: { acknowledged: boolean; deletedCount: number } = res.data;
    if (result.acknowledged && result.deletedCount > 0) setCurUser(undefined);
    setCurUserLoading(false);
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
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
