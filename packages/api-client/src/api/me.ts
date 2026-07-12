import { mutate } from "swr";
import type { User } from "@liftledger/shared";
import { useGet, usePatch, usePost, useDelete } from "../fetcher";

export interface Auth0Profile {
  emailVerified: boolean;
  username: string | null;
}

export const ME_BASE_PATH = "/users/me";

export const useMe = (enabled: boolean = true) =>
  useGet<User>(enabled ? ME_BASE_PATH : null);

export const useCurrentUserId = () => useMe().data?._id;

export const refreshMe = () => mutate(ME_BASE_PATH);

export const useAuth0Profile = (enabled: boolean = true) =>
  useGet<Auth0Profile>(enabled ? `${ME_BASE_PATH}/auth0` : null);

export const useResendVerification = () =>
  usePost<void, void>(`${ME_BASE_PATH}/resend-verification`);

export const useUpdateMyEmail = () =>
  usePatch<{ email: string }, User>(`${ME_BASE_PATH}/email`, {
    onSuccess: (user) => mutate(ME_BASE_PATH, user, { revalidate: false }),
  });

export const useUpdateMyName = () =>
  usePatch<{ fullName: string }, User>(`${ME_BASE_PATH}/name`, {
    onSuccess: (user) => mutate(ME_BASE_PATH, user, { revalidate: false }),
  });

export const useUpdateMyUsername = () =>
  usePatch<{ username: string }, User>(`${ME_BASE_PATH}/username`, {
    onSuccess: (user) => mutate(ME_BASE_PATH, user, { revalidate: false }),
  });

export const useDeleteMe = () =>
  useDelete<void, void>(ME_BASE_PATH, {
    onSuccess: () => mutate(ME_BASE_PATH, undefined, { revalidate: false }),
  });

export const useRequestPasswordReset = () =>
  usePost<void, void>(`${ME_BASE_PATH}/password-reset`);
