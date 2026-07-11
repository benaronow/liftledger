import type { OptionField, UserDoc } from "./shared";

// Returned sorted so every option-list response arrives ready to display.
export const getOptions = (
  me: UserDoc,
  field: OptionField["field"],
): string[] => [...(me.get(field) ?? [])].sort();
