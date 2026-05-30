"use client";

import { User } from "@/lib/types";
import { SessionData } from "@auth0/nextjs-auth0/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/config";
import { AxiosError } from "axios";

export const USER_API_URL = "/api/user";

interface UserContextType {
  session: SessionData | null;
  attemptedLogin: boolean;
  curUser?: User;
  curUserLoading: boolean;
  getUser: (id: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  quitBlock: () => Promise<void>;
}

const defaultUserContext: UserContextType = {
  session: null,
  attemptedLogin: false,
  curUserLoading: true,
  getUser: async () => {},
  getCurrentUser: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  updateEmail: async () => {},
  quitBlock: async () => {},
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

  const getUser = useCallback(
    async (id: string) => {
      setCurUserLoading(true);

      try {
        const res = await api.get(`${USER_API_URL}/${id}`);
        const result: User = res.data;
        if (result) setCurUser(result);
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to get user");
      } finally {
        setCurUserLoading(false);
      }
    },
    [setCurUserLoading, setCurUser],
  );

  const getCurrentUser = useCallback(async () => {
    setCurUserLoading(true);

    try {
      const res = await api.get(`${USER_API_URL}/me`);
      const result: User = res.data;
      if (result) setCurUser(result);
    } catch (e: unknown) {
      const status = (e as AxiosError)?.response?.status;
      if (status === 404) return;
      const error = (e as AxiosError<{ error?: string }>)?.response?.data
        ?.error;
      throw new Error(error ?? "Failed to get current user");
    } finally {
      setAttemptedLogin(true);
      setCurUserLoading(false);
    }
  }, [setCurUserLoading, setCurUser, setAttemptedLogin]);

  useEffect(() => {
    if (!session?.user.sub || curUser) return;

    getCurrentUser().catch((e) => console.error(e));
  }, [session, curUser, getCurrentUser]);

  const createUser = useCallback(
    async (user: Partial<User>) => {
      setCurUserLoading(true);

      try {
        const res = await api.post(`${USER_API_URL}`, user);
        const result: User = res.data;
        if (result) setCurUser(result);
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to create user");
      } finally {
        setCurUserLoading(false);
      }
    },
    [setCurUserLoading, setCurUser],
  );

  const updateUser = useCallback(
    async (user: User) => {
      setCurUserLoading(true);

      try {
        const res = await api.put(`${USER_API_URL}/${user._id}`, user);
        const result: User = res.data;
        if (result) setCurUser(result);
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to update user");
      } finally {
        setCurUserLoading(false);
      }
    },
    [setCurUserLoading, setCurUser],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setCurUserLoading(true);

      try {
        await api.delete("/api/auth0", { data: { id } });
        setCurUser(undefined);
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to delete user");
      } finally {
        setCurUserLoading(false);
      }
    },
    [setCurUserLoading, setCurUser],
  );

  const updateEmail = useCallback(
    async (email: string) => {
      setCurUserLoading(true);

      try {
        const res = await api.patch("/api/auth0", { email });
        const result: User = res.data;
        if (result) setCurUser(result);
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to update email");
      } finally {
        setCurUserLoading(false);
      }
    },
    [setCurUser],
  );

  const quitBlock = useCallback(async () => {
    if (!curUser || !curUser._id || !curUser?.curBlock) return;

    setCurUserLoading(true);

    try {
      const res = await api.post(`${USER_API_URL}/${curUser._id}/quitBlock`);
      const result: User = res.data;
      if (result) setCurUser(result);
    } catch (e: unknown) {
      const error = (e as AxiosError<{ error?: string }>)?.response?.data
        ?.error;
      throw new Error(error ?? "Failed to quit block");
    } finally {
      setCurUserLoading(false);
    }
  }, [curUser, setCurUserLoading, setCurUser]);

  return (
    <UserContext.Provider
      value={{
        session,
        attemptedLogin,
        curUser,
        curUserLoading,
        getUser,
        getCurrentUser,
        createUser,
        updateUser,
        deleteUser,
        updateEmail,
        quitBlock,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
