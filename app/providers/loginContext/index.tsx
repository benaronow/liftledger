import { useLogin } from "@/app/providers/loginContext/useLogin";
import { User } from "@/types";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { createContext, ReactNode, useContext } from "react";

interface LoginContextType {
  session: SessionData | null;
  attemptedLogin: boolean;
  curUser: User | undefined;
}

const defaultLoginContext: LoginContextType = {
  session: null,
  attemptedLogin: false,
  curUser: undefined,
};

export const LoginContext = createContext(defaultLoginContext);

interface LoginProviderProps {
  readonly children: ReactNode;
  session: SessionData | null;
}

export const LoginProvider = ({ children, session }: LoginProviderProps) => {
  const { attemptedLogin, curUser } = useLogin(session?.user.email || "");

  return (
    <LoginContext value={{ session, attemptedLogin, curUser }}>
      {children}
    </LoginContext>
  );
};

export const useTheme = () => useContext(LoginContext);
