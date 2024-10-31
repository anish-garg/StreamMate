/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myMedia, setMyMedia] = useState();
    const [remoteMedia, setRemoteMedia] = useState();

    // handleUserJoined: triggered when a new user joins the room.
    // It logs the user’s email and sets the remote socket ID.
    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    // handleCallUser: initiates a call to the remote user.
    // It captures the local media stream, creates an offer, and sends it to the remote user.
    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit('user:call', { to: remoteSocketId, offer });
        setMyMedia(stream);
    }, [remoteSocketId, socket]);

    // handleIncomingCall: processes an incoming call from a remote user.
    // It captures the local media stream, logs the call details, creates an answer,
    // and sends the response back to the caller.
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

    // sendStreams: adds all tracks from the local media stream to the peer connection.
    // This function is called after a call has been accepted or when streaming is manually triggered.
    const sendStreams = useCallback(() => {
        for (const track of myMedia.getTracks()) {
            peer.peer.addTrack(track, myMedia);
        }
    }, [myMedia]);

    // handleCallAccepted: handles the call acceptance response from the remote user.
    // It sets the local description and starts sending the media streams.
    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log('call accepted');
        sendStreams();
    }, [sendStreams]);

    // handleNegoNeeded: triggered when renegotiation is required.
    // It creates a new offer and notifies the remote user that negotiation is needed.
    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    // handleNegoNeedIncoming: processes an incoming negotiation request from the remote user.
    // It generates an answer for the negotiation and sends it back to the requester.
    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
    }, [socket]);

    // handleNegoNeedFinal: finalizes the negotiation process by setting the local description with the received answer.
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, [])

    // useEffect for negotiationneeded event: adds an event listener for when renegotiation is required.
    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    // useEffect for track event: listens for incoming media tracks from the remote user and sets the remote media.
    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteMedia = ev.streams;
            console.log("GOT TRACKS!");
            setRemoteMedia(remoteMedia[0]);
        });
    }, []);

    // useEffect for socket events: sets up and cleans up socket event listeners
    // for user joining, incoming calls, call acceptance, and negotiation events.
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

export default Room;
