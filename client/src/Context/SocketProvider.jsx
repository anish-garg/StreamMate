/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
    var str1 = "localHost:3000";
    var str2 = "https://stream-mate-omega.vercel.app/?vercelToolbarCode=B6s2chdL3k_0X8Q";
    // useMemo is a React hook that memoizes (caches) the result of a function, storing it and returning the stored value if the function’s dependencies haven’t changed. This prevents unnecessary re-calculations that could impact performance, especially for expensive operations.
    // For connecting backend to frontend
    const socket = useMemo(() => io(str1 || str2), [str1, str2]);
    return (<SocketContext.Provider value={socket}>
        {props.children}
    </SocketContext.Provider>)
} 