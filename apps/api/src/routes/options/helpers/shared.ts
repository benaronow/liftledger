import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";

export type OptionField =
  | { field: "exerciseNames"; exerciseKey: "name" }
  | { field: "exerciseEquipment"; exerciseKey: "equipment" }
  | { field: "units"; exerciseKey: "unit" }
  | { field: "gyms"; exerciseKey: "gym" };

export type UserDoc = InstanceType<typeof UserModel>;

export const populatedUser = (id: string) =>
  UserModel.findOne({ _id: id }).populate([
    { path: "programs", model: ProgramModel },
  ]);
