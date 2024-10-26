const { Server } = require('socket.io');

const io = new Server(3000, {
    cors: true,
});
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    socket.on('room:join', (data) => {
        // console.log(data);
        const { email, roomNumber } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(socket.id).emit("room:join", data);
    });
});