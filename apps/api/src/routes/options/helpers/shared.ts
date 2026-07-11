import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";

export type OptionField =
  | { field: "options.exerciseNames"; exerciseKey: "name" }
  | { field: "options.equipment"; exerciseKey: "equipment" }
  | { field: "options.units"; exerciseKey: "unit" }
  | { field: "options.gyms"; exerciseKey: "gym" };

export type UserDoc = InstanceType<typeof UserModel>;

export const populatedUser = (id: string) =>
  UserModel.findOne({ _id: id }).populate([
    { path: "programs", model: ProgramModel },
  ]);
