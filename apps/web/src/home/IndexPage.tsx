import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useCreateUser, useMe } from "@liftledger/api-client";
import { LogoSpinner } from "@/components/LogoSpinner";

// Landing route. Once Auth0 silent-auth + useMe settles, either redirect to
// /dashboard (existing user) or auto-create the DB record (first login).
export const IndexPage = () => {
  const navigate = useNavigate();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { data: curUser, isLoading, error } = useMe(isAuthenticated);
  const { trigger: createUser } = useCreateUser();

  // "Have we attempted /users/me?" — SWR has settled, either data or error
  // (404 = "first login, no DB record yet").
  const attemptedLogin =
    isAuthenticated &&
    !isLoading &&
    (curUser !== undefined || error !== undefined);

  const createNewUser = useCallback(async () => {
    if (!auth0User?.sub || !auth0User.email) return;

    try {
      await createUser({
        auth0Id: auth0User.sub,
        email: auth0User.email,
        timerPresets: { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 },
      });
    } catch (e) {
      console.error("Failed to create user:", e);
      navigate("/login");
    }
  }, [auth0User, createUser, navigate]);

  useEffect(() => {
    if (!auth0User || !attemptedLogin) return;

    if (curUser) {
      navigate("/dashboard");
      return;
    }

    createNewUser();
  }, [auth0User, attemptedLogin, curUser, createNewUser, navigate]);

  return <LogoSpinner />;
};
