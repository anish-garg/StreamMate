/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Context/SocketProvider"

const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    })

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        return () => {
            socket.off('user:joined', handleUserJoined);
        };
    }, [socket, handleUserJoined])

    return (
        <>
            <div className='text-5xl'>Room</div>
            <h4>{remoteSocketId ? 'Connected' : 'No one in Room'}</h4>
            {remoteSocketId && <button>CALL</button>}
        </>
    )
}

export default Room
