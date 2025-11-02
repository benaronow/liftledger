import { User } from "@/lib/types";
import { SessionData } from "@auth0/nextjs-auth0/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/lib/config";

const USER_API_URL = "/api/user";

interface UserContextType {
  session: SessionData | null;
  attemptedLogin: boolean;
  curUser?: User;
  curUserLoading: boolean;
  getUser: (email: string) => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  introMessageOpen: boolean;
  setIntroMessageOpen: Dispatch<SetStateAction<boolean>>;
}

const defaultUserContext: UserContextType = {
  session: null,
  attemptedLogin: false,
  curUserLoading: true,
  getUser: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  introMessageOpen: false,
  setIntroMessageOpen: () => {},
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
  const [curUserLoading, setCurUserLoading] = useState(true);
  const [introMessageOpen, setIntroMessageOpen] = useState(false);

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
    const res = await api.post(`${USER_API_URL}`, user);
    const result: User = res.data;
    if (result) setCurUser(result);
  };

  const updateUser = async (user: User) => {
    const res = await api.post(`${USER_API_URL}/${user._id}`, user);
    const result: User = res.data;
    if (result) setCurUser(result);
  };

  const deleteUser = async (uid: string) => {
    const res = await api.delete(`${USER_API_URL}/${uid}`);
    const result: { acknowledged: boolean; deletedCount: number } = res.data;
    if (result.acknowledged && result.deletedCount > 0) setCurUser(undefined);
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
        introMessageOpen,
        setIntroMessageOpen,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
