import {
  useOptions,
  useAddOption,
  useRenameOption,
  useRemoveOption,
} from "./options";

export const useEquipmentOptions = () => useOptions("equipment");
export const useAddEquipment = () => useAddOption("equipment");
export const useRenameEquipment = () => useRenameOption("equipment");
export const useRemoveEquipment = () => useRemoveOption("equipment");
