import { getApiClient } from "./client";

// SWR's default fetcher uses native fetch. We use axios so we get the bearer
// interceptor + baseURL + axios error shape for free.
export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await getApiClient().get<T>(url);
  return res.data;
};
