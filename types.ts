export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  benchMax: number;
  squatMax: number;
  deadMax: number;
}

export interface GetParams {
  params: Promise<{ id: string }>;
}