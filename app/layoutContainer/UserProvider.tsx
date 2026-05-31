"use client";

import { Block, User } from "@/lib/types";
import { useAuth0 } from "@auth0/auth0-react";
import {
  useCreateUser,
  useDeleteMe,
  useMe,
  useQuitBlock,
  useStartBlock,
  useUpdateMyEmail,
  useUpdateUser,
} from "@liftledger/api-client";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { AxiosError } from "axios";

interface Auth0SessionUser {
  sub: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
}

interface UserContextType {
  auth0User: Auth0SessionUser | null;
  attemptedLogin: boolean;
  curUser?: User;
  curUserLoading: boolean;
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteCurrentUser: () => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  startBlock: (block: Block) => Promise<void>;
  quitBlock: () => Promise<void>;
}

const defaultUserContext: UserContextType = {
  auth0User: null,
  attemptedLogin: false,
  curUserLoading: true,
  createUser: async () => {},
  updateUser: async () => {},
  deleteCurrentUser: async () => {},
  updateEmail: async () => {},
  startBlock: async () => {},
  quitBlock: async () => {},
};

export const UserContext = createContext(defaultUserContext);

const errorMessage = (e: unknown, fallback: string) => {
  const msg = (e as AxiosError<{ error?: string }>)?.response?.data?.error;
  return new Error(msg ?? fallback);
};

export const UserProvider = ({ children }: PropsWithChildren) => {
  const { user, isAuthenticated, logout } = useAuth0();
  const auth0User: Auth0SessionUser | null = user?.sub
    ? {
        sub: user.sub,
        email: user.email,
        email_verified: user.email_verified,
        picture: user.picture,
      }
    : null;

  const {
    data: curUser,
    error,
    isLoading,
  } = useMe(isAuthenticated, {
    shouldRetryOnError: (err) =>
      (err as AxiosError)?.response?.status !== 404,
  });

  const attemptedLogin =
    !isLoading && (curUser !== undefined || error !== undefined);
  const curUserLoading = isAuthenticated && isLoading;

  const { trigger: triggerCreateUser } = useCreateUser();
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { trigger: triggerDeleteMe } = useDeleteMe();
  const { trigger: triggerUpdateEmail } = useUpdateMyEmail();
  const { trigger: triggerStartBlock } = useStartBlock();
  const { trigger: triggerQuitBlock } = useQuitBlock();

  const createUser = useCallback(
    async (user: Partial<User>) => {
      try {
        await triggerCreateUser(user);
      } catch (e) {
        throw errorMessage(e, "Failed to create user");
      }
    },
    [triggerCreateUser],
  );

  const updateUser = useCallback(
    async (user: User) => {
      try {
        await triggerUpdateUser(user);
      } catch (e) {
        throw errorMessage(e, "Failed to update user");
      }
    },
    [triggerUpdateUser],
  );

  const deleteCurrentUser = useCallback(async () => {
    try {
      await triggerDeleteMe();
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (e) {
      throw errorMessage(e, "Failed to delete user");
    }
  }, [triggerDeleteMe, logout]);

  const updateEmail = useCallback(
    async (email: string) => {
      try {
        await triggerUpdateEmail(email);
      } catch (e) {
        throw errorMessage(e, "Failed to update email");
      }
    },
    [triggerUpdateEmail],
  );

  const startBlock = useCallback(
    async (block: Block) => {
      if (!curUser?._id) return;
      try {
        await triggerStartBlock({ userId: curUser._id, block });
      } catch (e) {
        throw errorMessage(e, "Failed to start block");
      }
    },
    [curUser?._id, triggerStartBlock],
  );

  const quitBlock = useCallback(async () => {
    if (!curUser?._id || !curUser?.curBlock) return;
    try {
      await triggerQuitBlock(curUser._id);
    } catch (e) {
      throw errorMessage(e, "Failed to quit block");
    }
  }, [curUser?._id, curUser?.curBlock, triggerQuitBlock]);

  return (
    <UserContext.Provider
      value={{
        auth0User,
        attemptedLogin,
        curUser,
        curUserLoading,
        createUser,
        updateUser,
        deleteCurrentUser,
        updateEmail,
        startBlock,
        quitBlock,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export const USER_API_URL = "/users";
