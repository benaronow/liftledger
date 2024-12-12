import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

export type FitnessLogSocket = Server<ServerToClientEvents>;

/**
 * Interface representing the possible events that the server can emit to the client.
 */
export interface ServerToClientEvents {

}