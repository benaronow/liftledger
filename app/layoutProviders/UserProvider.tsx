"use client";

import { Exercise, ExerciseApparatus, ExerciseName, User } from "@/lib/types";
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
  addCustomExerciseName: (value: string) => Promise<void>;
  addCustomExerciseApparatus: (value: string) => Promise<void>;
  getFilteredExerciseOptions: (
    curExercise: Exercise,
    allReservedExercises: Exercise[],
    type: "name" | "apparatus",
  ) => string[];
}

const defaultUserContext: UserContextType = {
  session: null,
  attemptedLogin: false,
  curUserLoading: true,
  getUser: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  addCustomExerciseName: async () => {},
  addCustomExerciseApparatus: async () => {},
  getFilteredExerciseOptions: () => [],
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

  const addCustomExerciseName = async (value: string) => {
    if (
      !curUser ||
      curUser.customExercises?.includes(value) ||
      Object.values(ExerciseName).includes(value as ExerciseName)
    )
      return;
    await updateUser({
      ...curUser,
      customExercises: [...(curUser.customExercises ?? []), value],
    });
  };

  const addCustomExerciseApparatus = async (value: string) => {
    if (
      !curUser ||
      curUser.customApparatuses?.includes(value) ||
      Object.values(ExerciseApparatus).includes(value as ExerciseApparatus)
    )
      return;
    await updateUser({
      ...curUser,
      customApparatuses: [...(curUser.customApparatuses ?? []), value],
    });
  };

  const getFilteredExerciseNameOptions = useCallback(
    (curApparatus: string, unavailableExercises: Exercise[]) => {
      const baseNames = Object.values(ExerciseName);

      const customNames =
        curUser?.customExercises?.filter(
          (c) =>
            !baseNames.some((b: string) => b.toLowerCase() === c.toLowerCase()),
        ) ?? [];

      return [...baseNames, ...customNames].filter(
        (n) =>
          !unavailableExercises.find(
            (e) => e.name === n && e.apparatus === curApparatus,
          ),
      );
    },
    [curUser],
  );

  const getFilteredExerciseApparatusOptions = useCallback(
    (curName: string, unavailableExercises: Exercise[]) => {
      const baseApparatuses = Object.values(ExerciseApparatus);

      const customApparatuses =
        curUser?.customApparatuses?.filter(
          (c) =>
            !baseApparatuses.some(
              (b: string) => b.toLowerCase() === c.toLowerCase(),
            ),
        ) ?? [];

      return [...baseApparatuses, ...customApparatuses].filter(
        (a) =>
          !unavailableExercises.find(
            (e) => e.apparatus === a && e.name === curName,
          ),
      );
    },
    [curUser],
  );

  const getFilteredExerciseOptions = useCallback(
    (
      curExercise: Exercise,
      allReservedExercises: Exercise[],
      type: "name" | "apparatus",
    ) => {
      const unavailableExercises = allReservedExercises.filter(
        (e) =>
          e.name !== curExercise.name || e.apparatus !== curExercise.apparatus,
      );

      if (type === "name")
        return getFilteredExerciseNameOptions(
          curExercise.apparatus,
          unavailableExercises,
        );

      if (type === "apparatus")
        return getFilteredExerciseApparatusOptions(
          curExercise.name,
          unavailableExercises,
        );

      return [];
    },
    [getFilteredExerciseNameOptions, getFilteredExerciseApparatusOptions],
  );

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
        addCustomExerciseName,
        addCustomExerciseApparatus,
        getFilteredExerciseOptions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
