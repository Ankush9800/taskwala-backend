import dotenv from "dotenv"
import connectdb from "./src/db/mongodb.js"
import { app } from "./app.js"
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({
    path : '.env'
})

// Enable trust proxy if behind Nginx
app.set('trust proxy', true);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    transports: ["polling", "websocket"],
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io/",
    cookie: {
        name: "io",
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true
    }
});

let users = []

// Add error handling for IO server
io.engine.on("connection_error", (err) => {
    console.log(`Connection error: ${err.message}, code: ${err.code}, context: ${err.context}`);
});

// Log all socket.io events for debugging
io.engine.on("headers", (headers, req) => {
    console.log("Socket.IO Headers:", headers);
});

io.engine.on("initial_headers", (headers, req) => {
    console.log("Socket.IO Initial Headers:", headers);
});

io.on("connection",(socket)=>{
    console.log("A user connected with ID:", socket.id);
    
    // Log connection details
    console.log("Transport used:", socket.conn.transport.name);
    console.log("Headers:", socket.handshake.headers);
    console.log("Query:", socket.handshake.query);
    
    socket.conn.on("upgrade", (transport) => {
        console.log("Transport upgraded from", socket.conn.transport.name, "to", transport.name);
    });
    socket.on("register-user",(userData)=>{
        console.log(userData)
        const userIndex = users.findIndex(u=>u.userId === userData.uid)
        if (userIndex !== -1) {
            users[userIndex].socketId = socket.id
        }else{
            users.push({
                userId:userData.uid,
                socketId:socket.id,
                fullName:userData.name,
                email:userData.email
            })
        }
        const adminUser = users.find(u=>u.userId === "6874bec6ca2af2a1af7b89b6")
        io.to(adminUser?.socketId).emit("get-users",users)
        // console.log("updated users", users, adminUser)
    })
    socket.on("request-users",(adminId)=>{
        const adminTargetId = users.find(u=> u.userId === adminId)
        // console.log("All users",adminTargetId,users)
        io.to(adminTargetId.socketId).emit("get-users",users)
    })
    socket.on("send-private-message",({id,messagess})=>{
        const targetId = users.find(u=>u.userId === id)
        console.log("user massage",targetId?.socketId)
        const messages = {
            message: messagess.message,
            time: messagess.time,
            isServer:true
        }
        io.to(targetId?.socketId).emit("get-private-message", messages)
    })

    socket.on("disconnect", () => {
        users = users.filter(u => u.socketId !== socket.id);
        console.log('User disconnected');
    });
})

connectdb()
.then(()=>{
    httpServer.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("mongodb connection failed", error)
})