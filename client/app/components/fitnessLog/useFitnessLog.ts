import { getAllUsers, selectCurUser, selectUsers } from "@/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { FitnessLogSocket } from "@/types";
import { useEffect } from "react";

export const useFitnessLog = (socket: FitnessLogSocket | null) => {
    const dispatch = useAppDispatch();
    const curUser = useAppSelector(selectCurUser);

    useEffect(() => {
        dispatch(getAllUsers());
    })

    useEffect(() => {
        const handleUsersUpdate = () => {
            dispatch(getAllUsers());
        }

        socket?.on('usersUpdate', handleUsersUpdate);
        return () => {
            socket?.off('usersUpdate', handleUsersUpdate);
        };

    }, [socket]);

    return { curUser };
}