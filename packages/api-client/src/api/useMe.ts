import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import type { User } from "@liftledger/shared";
import { getApiClient } from "../client";
import { fetcher } from "../fetcher";

export const meKey = () => "/users/me";

export const useMe = (
  enabled: boolean = true,
  config?: SWRConfiguration<User>,
) => useSWR<User>(enabled ? meKey() : null, fetcher, config);

export interface Auth0Profile {
  emailVerified: boolean;
  username: string | null;
}

export const auth0ProfileKey = () => "/users/me/auth0";

// Live Auth0 state for the current session — works before a DB user exists, so
// it drives the onboarding email-verification gate and username prefill.
export const useAuth0Profile = (
  enabled: boolean = true,
  config?: SWRConfiguration<Auth0Profile>,
) =>
  useSWR<Auth0Profile>(enabled ? auth0ProfileKey() : null, fetcher, config);

export const useResendVerification = () =>
  useSWRMutation("mutation:resendVerification", async (): Promise<void> => {
    await getApiClient().post("/users/me/resend-verification", {});
  });

export const useUpdateMyEmail = () =>
  useSWRMutation(
    "mutation:updateMyEmail",
    async (_key: string, { arg: email }: { arg: string }): Promise<User> => {
      const res = await getApiClient().patch<User>("/users/me/email", {
        email,
      });
      await mutate(meKey(), res.data, { revalidate: false });
      return res.data;
    },
  );

export const useUpdateMyName = () =>
  useSWRMutation(
    "mutation:updateMyName",
    async (_key: string, { arg: fullName }: { arg: string }): Promise<User> => {
      const res = await getApiClient().patch<User>("/users/me/name", {
        fullName,
      });
      await mutate(meKey(), res.data, { revalidate: false });
      return res.data;
    },
  );

export const useUpdateMyUsername = () =>
  useSWRMutation(
    "mutation:updateMyUsername",
    async (_key: string, { arg: username }: { arg: string }): Promise<User> => {
      const res = await getApiClient().patch<User>("/users/me/username", {
        username,
      });
      await mutate(meKey(), res.data, { revalidate: false });
      return res.data;
    },
  );

export const useDeleteMe = () =>
  useSWRMutation("mutation:deleteMe", async (): Promise<void> => {
    await getApiClient().delete("/users/me");
    await mutate(meKey(), undefined, { revalidate: false });
  });

export const useRequestPasswordReset = () =>
  useSWRMutation(
    "mutation:requestPasswordReset",
    async (): Promise<void> => {
      await getApiClient().post("/users/me/password-reset", {});
    },
  );
