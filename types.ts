export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  curBenchMax: number;
  curSquatMax: number;
  curDeadMax: number;
}

export interface GetParams {
  params: Promise<{ id: string }>;
}