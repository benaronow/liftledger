import {
  useOptions,
  useAddOption,
  useRenameOption,
  useRemoveOption,
} from "./options";

export const useGymOptions = () => useOptions("gyms");
export const useAddGym = () => useAddOption("gyms");
export const useRenameGym = () => useRenameOption("gyms");
export const useRemoveGym = () => useRemoveOption("gyms");
