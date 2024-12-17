export interface User {
  _id?: string;
  username: string;
  password: string;
  favExercise: string;
}

export interface GetParams {
  params: Promise<{ id: string }>;
}