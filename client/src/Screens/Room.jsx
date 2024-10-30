/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Context/SocketProvider"
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myMedia, setMyMedia] = useState();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit('user:call', { to: remoteSocketId, offer });
        setMyMedia(stream);
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(({ from, offer }) => {
        console.log('Incoming Call', from, offer);
    }, []);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
        };
    }, [socket, handleUserJoined, handleIncomingCall]);

    return (
        <>
            <div className='text-5xl'>Room</div>
            <h4>{remoteSocketId ? 'Connected' : 'No one in Room'}</h4>
            {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
            {myMedia && <ReactPlayer playing muted height="250px" width="500px" url={myMedia} />}
        </>
    )
}

export default Room