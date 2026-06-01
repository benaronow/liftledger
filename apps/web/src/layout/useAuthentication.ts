import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useMe, useCreateUser } from "@liftledger/api-client";
import { RouteType } from "@liftledger/shared";

export const useAuthentication = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth0();
  const {
    data: curUser,
    isLoading: isUserLoading,
    error: userError,
  } = useMe(isAuthenticated);
  const { trigger: createUser } = useCreateUser();

  // Effect to handle redirects based on authentication status and current path.
  useEffect(() => {
    if (isAuthLoading) return;

    // Redirect unauthenticated users to Welcome
    if (!isAuthenticated && pathname !== RouteType.Welcome) {
      navigate(RouteType.Welcome);
      return;
    }

    // Redirect authenticated users away from Welcome
    if (isAuthenticated && pathname === RouteType.Welcome) {
      navigate(RouteType.Dashboard);
      return;
    }
  }, [isAuthenticated, isAuthLoading, pathname, navigate]);

  const hasUserSettled = useMemo(
    () => isAuthenticated && !isUserLoading && (!!curUser || !!userError),
    [isAuthenticated, isUserLoading, curUser, userError],
  );

  // Effect that runs on the root path for authenticated users
  // to ensure they have a corresponding user in our DB, creating one if necessary.
  useEffect(() => {
    // Only take action if we're on the root path, authenticated
    // and have resolved whether the user exists in our DB or not.
    if (!(pathname === "/" && hasUserSettled)) return;

    // Redirect existing users to Dashboard
    if (curUser) {
      navigate(RouteType.Dashboard);
      return;
    }

    // Create a new user if they don't exist in our DB
    createUser({
      auth0Id: auth0User!.sub,
      email: auth0User!.email,
      timerPresets: { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 },
    }).catch((e) => {
      console.error("Failed to create user:", e);
      navigate(RouteType.Welcome);
    });
  }, [pathname, auth0User, hasUserSettled, curUser, createUser, navigate]);

  const isAuthenticating = useMemo(() => {
    const isAuthenticatedOnWrongPage =
      isAuthenticated && (pathname === "/" || pathname === RouteType.Welcome);

    const isUnauthenticatedOnWrongPage =
      !isAuthenticated && pathname !== RouteType.Welcome;

    return (
      isAuthLoading ||
      isAuthenticatedOnWrongPage ||
      isUnauthenticatedOnWrongPage
    );
  }, [isAuthenticated, isAuthLoading, pathname]);

  return { isAuthenticated, isAuthenticating };
};
