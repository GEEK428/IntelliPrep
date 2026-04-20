import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket = null;

export const initSocket = (token) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        auth: {
            token
        },
        transports: ["websocket", "polling"], // Ensure compatibility
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const onNotification = (callback) => {
    if (!socket) return;
    socket.on("notification", callback);
};

export const offNotification = (callback) => {
    if (!socket) return;
    socket.off("notification", callback);
};
