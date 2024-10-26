import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";

const Lobby = () => {
    const [email, setEmail] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const socket = useSocket();
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        // console.log({
        //     email, roomNumber,
        // });
        socket.emit('room:join', { email, roomNumber });

    }, [email, roomNumber, socket]);
    const handleJoinRoom = useCallback((data) => {
        const { email, roomNumber } = data;
        console.log(email, roomNumber);
    }, []);

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
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Id</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="room">Room Number</label>
                <input type="text" id="room" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                <br />
                <button>Join Now</button>
            </form>
        </>
    )
}

export default Lobby