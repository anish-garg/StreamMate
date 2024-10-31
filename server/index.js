const { Server } = require('socket.io');

// Creates a new Socket.IO server on port 3000 with Cross-Origin Resource Sharing (CORS) enabled
const io = new Server(3000, {
    cors: true,
});

const emailToSocketIdMap = new Map(); // Maps user email to socket ID
const socketIdToEmailMap = new Map(); // Maps socket ID to user email

io.on("connection", (socket) => {
    console.log("Socket connected", socket.id); // Logs connection with the client's socket ID

    // Event listener for 'room:join' event - when a user joins a room
    socket.on('room:join', (data) => {
        const { email, room } = data; // Destructures email and room from data
        emailToSocketIdMap.set(email, socket.id); // Maps the user's email to their socket ID
        socketIdToEmailMap.set(socket.id, email); // Maps the socket ID to the user's email

        io.to(room).emit('user:joined', { email, id: socket.id }); // Broadcasts to the room that a new user has joined with their email and ID
        socket.join(room); // Adds the socket to the specified room
        io.to(socket.id).emit("room:join", data); // Sends a confirmation of the room join back to the joining socket
    });

    // Event listener for 'user:call' - when a user initiates a call
    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer }); // Sends the call offer to the target socket
    });

    // Event listener for 'call:accepted' - when a user accepts a call
    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans }); // Sends the answer to the user who initiated the call
    });

    // Event listener for 'peer:nego:needed' - when renegotiation is needed
    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer }); // Notifies the other peer that renegotiation is required, sending a new offer
    });

    // Event listener for 'peer:nego:done' - when renegotiation is completed
    socket.on('peer:nego:done', ({ to, ans }) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans }); // Sends the answer of renegotiation to complete the process
    });
});
