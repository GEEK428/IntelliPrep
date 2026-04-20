const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:5174",
                process.env.FRONTEND_URL
            ].filter(Boolean),
            credentials: true
        }
    });

    // Authentication middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.id})`);
        
        // Join a room specific to the user ID for targeted emits
        socket.join(socket.userId);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

/**
 * Emit a notification to a specific user
 * @param {string} userId 
 * @param {object} data 
 */
function emitNotification(userId, data) {
    if (io) {
        io.to(userId).emit("notification", data);
    }
}

module.exports = { initSocket, getIO, emitNotification };
