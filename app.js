import { Server } from "socket.io";
import 'dotenv/config';

const CLIENT_URL = process.env.CLIENT_URL;

// Initialize the server
const io = new Server({
    cors: {
        origin: CLIENT_URL, // Allow requests from the client URL
    },
});

// Use a Map for more efficient user lookups
let onlineUsers = new Map();

// Add a user to the online user list
const addUser = (userId, socketId) => {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, socketId);
    }
};

// Remove a user from the online user list
const removeUser = (socketId) => {
    for (let [userId, id] of onlineUsers) {
        if (id === socketId) {
            onlineUsers.delete(userId);
            break;
        }
    }
};

// Get a user's socket ID by their user ID
const getUser = (userId) => {
    return onlineUsers.get(userId);
};

// WebSocket connection handler
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Add new user
    socket.on("newUser", (userId) => {
        console.log(`User added: ${userId}`);
        addUser(userId, socket.id);
    });

    // Send message to a specific user
    socket.on("sendMessage", ({ receiverId, data }) => {
        const receiverSocketId = getUser(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getMessage", data);
            console.log(`Message sent to ${receiverId}:`, data);
        } else {
            console.log(`Receiver ${receiverId} is not online.`);
        }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        removeUser(socket.id);
    });
});

// Start the server
io.listen(4000);
console.log("WebSocket server is running on port 4000");
