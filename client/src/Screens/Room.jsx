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
    const [remoteMedia, setRemoteMedia] = useState();

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

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyMedia(stream);
        console.log('Incoming Call', from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', ({ to: from, ans }));
    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myMedia.getTracks()) {
            peer.peer.addTrack(track, myMedia);
        }
    }, [myMedia]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log('call accepted');
        sendStreams();
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteMedia = ev.streams;
            console.log("GOT TRACKS!");
            setRemoteMedia(remoteMedia[0]);
        });
    }, []);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
            {myMedia && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
            {myMedia && (
                <>
                    <h1>My Stream</h1>
                    <ReactPlayer
                        playing
                        muted
                        height="100px"
                        width="200px"
                        url={myMedia}
                    />
                </>
            )}
            {remoteMedia && (
                <>
                    <h1>Remote Stream</h1>
                    <ReactPlayer
                        playing
                        muted
                        height="100px"
                        width="200px"
                        url={remoteMedia}
                    />
                </>
            )}
        </div>
    );
};

export default Room