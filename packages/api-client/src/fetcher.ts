import useSWR, { SWRConfiguration, KeyedMutator, mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { getApiClient } from "./client";

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await getApiClient().get<T>(url);
  return res.data;
};

export interface UseGetResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: KeyedMutator<T>;
}

export const useGet = <T = unknown>(
  key: string | null,
  config?: SWRConfiguration<T>,
): UseGetResult<T> => {
  const {
    data,
    isLoading,
    error,
    mutate: refresh,
  } = useSWR<T>(key, fetcher, config);
  return { data, isLoading, error, refresh };
};

type MutationMethod = "post" | "put" | "patch" | "delete";

export interface MutationCallbacks<Arg, Data> {
  onSuccess?: (data: Data, arg: Arg) => unknown;
  onError?: (error: unknown, arg: Arg) => unknown;
}

export interface UseMutationOptions<Arg, Data> extends MutationCallbacks<
  Arg,
  Data
> {
  params?: (arg: Arg) => Record<string, unknown>;
  optimistic?: (arg: Arg) => { key: string | null; data: Data };
}

export interface UseMutationResult<Arg, Data> {
  send: (arg: Arg, callbacks?: MutationCallbacks<Arg, Data>) => Promise<Data>;
  data: Data | undefined;
  isLoading: boolean;
  error: unknown;
  reset: () => void;
}

const request = <Arg, Data>(
  method: MutationMethod,
  url: string,
  arg: Arg,
  options: UseMutationOptions<Arg, Data> | undefined,
) => {
  const client = getApiClient();
  switch (method) {
    case "post":
      return client.post<Data>(url, arg);
    case "put":
      return client.put<Data>(url, arg);
    case "patch":
      return client.patch<Data>(url, arg);
    case "delete":
      return client.delete<Data>(url, { params: options?.params?.(arg) });
  }
};

export const useMutation = <Arg = void, Data = unknown>(
  method: MutationMethod,
  url: string,
  options?: UseMutationOptions<Arg, Data>,
): UseMutationResult<Arg, Data> => {
  const { trigger, data, error, isMutating, reset } = useSWRMutation<
    Data,
    unknown,
    string,
    Arg
  >(`${method} ${url}`, async (_key, { arg }) => {
    try {
      let result: Data;
      const req = request<Arg, Data>(method, url, arg, options);
      if (options?.optimistic) {
        const { key, data: optimisticData } = options.optimistic(arg);
        await mutate(
          key,
          req.then(() => optimisticData),
          {
            optimisticData,
            rollbackOnError: true,
            revalidate: false,
          },
        );
        result = optimisticData;
      } else {
        result = (await req).data;
      }
      await options?.onSuccess?.(result, arg);
      return result;
    } catch (err) {
      await options?.onError?.(err, arg);
      throw err;
    }
  });

  const run = trigger as unknown as (arg: Arg) => Promise<Data>;
  const send = async (arg: Arg, callbacks?: MutationCallbacks<Arg, Data>) => {
    try {
      const result = await run(arg);
      await callbacks?.onSuccess?.(result, arg);
      return result;
    } catch (err) {
      await callbacks?.onError?.(err, arg);
      throw err;
    }
  };

  return {
    send,
    data,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const usePost = <Arg = void, Data = unknown>(
  url: string,
  options?: UseMutationOptions<Arg, Data>,
) => useMutation<Arg, Data>("post", url, options);

export const usePut = <Arg = void, Data = unknown>(
  url: string,
  options?: UseMutationOptions<Arg, Data>,
) => useMutation<Arg, Data>("put", url, options);

export const usePatch = <Arg = void, Data = unknown>(
  url: string,
  options?: UseMutationOptions<Arg, Data>,
) => useMutation<Arg, Data>("patch", url, options);

export const useDelete = <Arg = void, Data = unknown>(
  url: string,
  options?: UseMutationOptions<Arg, Data>,
) => useMutation<Arg, Data>("delete", url, options);
