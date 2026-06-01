import { useCallback } from "react";
import { useSearchParams } from "react-router";

export const useProgressSelection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedName = searchParams.get("name") ?? "";
  const selectedApparatus = searchParams.get("apparatus") ?? "";

  const setSelectedName = useCallback(
    (name: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (name) next.set("name", name);
          else next.delete("name");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSelectedApparatus = useCallback(
    (apparatus: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (apparatus) next.set("apparatus", apparatus);
          else next.delete("apparatus");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    selectedName,
    selectedApparatus,
    setSelectedName,
    setSelectedApparatus,
  };
};
