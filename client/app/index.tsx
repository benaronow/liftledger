"use client";

import { FitnessLogSocket } from "@/types";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FitnessLog } from "./components/fitnessLog/FitnessLog";

export const App = () => {
  const [socket, setSocket] = useState<FitnessLogSocket | null>(null);

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;

  if (serverURL === undefined) {
    throw new Error("Env variable 'NEXT_PUBLIC_SERVER_URL' must be defined");
  }

  useEffect(() => {
    if (!socket) {
      setSocket(io(serverURL));
    }

    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [socket, serverURL]);

  return <FitnessLog socket={socket} />;
};
