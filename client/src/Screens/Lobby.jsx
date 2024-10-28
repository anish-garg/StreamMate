/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";
import { useNavigate } from 'react-router-dom'

const Lobby = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket();
    const navigate = useNavigate();
    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        // console.log({
        //     email, room,
        // });
        socket.emit('room:join', { email, room });

    }, [email, room, socket]);
    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        // console.log(email, room);
        navigate(`room/${room}`);
    }, [navigate]);

    useEffect(() => {
        // socket.on('room:join', (data) => {
        //     console.log(`Data From Backend ${data}`);
        // });
        socket.on('room:join', (handleJoinRoom));
        return () => {
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);

    return (
        <>
            <div className="text-5xl">Lobby</div>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email Id</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="room">Room Number</label>
                <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} />
                <br />
                <button>Join Now</button>
            </form>
        </>
    )
}

export default Lobby