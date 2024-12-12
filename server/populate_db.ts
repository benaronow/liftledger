import mongoose from 'mongoose';
import UserModel from './models/user';
import { User } from './types';

const userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
  throw new Error('ERROR: You need to specify a valid mongodb URL as the first argument');
}

const mongoDB = userArgs[0];
mongoose.connect(mongoDB);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function userCreate(
  uid: string,
  username: string,
  password: string,
  favExercise: string,
): Promise<User> {
  if (
    username === '' ||
    password === '' ||
    favExercise === ''
  )
    throw new Error('Invalid User Format');
  const userDetail: User = {
    _id: new mongoose.Types.ObjectId(uid),
    username: username,
    password: password,
    favExercise: favExercise,
  };
  return await UserModel.create(userDetail);
}

/**
 * Populates the database with predefined data.
 * Logs the status of the operation to the console.
 */
const populate = async () => {
  try {
    await userCreate(
      '89ABCDEF0123456789ABCDEF',
      'JojiJohn',
      'password1',
      'Squat',
    );
    await userCreate(
      'ABCDEF1234567890ABCDEF12',
      'saltyPeter',
      'password2',
      'Bench',
    );
    await userCreate(
      'FEDCBA9876543210FEDCBA98',
      'monkeyABC',
      'password3',
      'Deadlift',
    );

    console.log('Database populated');
  } catch (err) {
    console.log('ERROR: ' + err);
  } finally {
    if (db) db.close();
    console.log('done');
  }
};

populate();

console.log('Processing ...');
