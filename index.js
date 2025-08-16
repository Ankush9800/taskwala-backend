import dotenv from "dotenv"
import connectdb from "./src/db/mongodb.js"
import { app } from "./app.js"
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({
    path : '.env'
})

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://offer.twcampaign.in", "https://api.twcampaign.in"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
    },
    transports: ["websocket", "polling"],  // ✅ allow both
    path: "/socket.io/",                   // ✅ match nginx location
    pingTimeout: 60000,                    // ✅ handle proxy/network delays
});

let users = []

// Add error handling for IO server
io.engine.on("connection_error", (err) => {
    console.log(`Connection error: ${err.message}, code: ${err.code}, context: ${err.context}`);
});

io.on("connection",(socket)=>{
    console.log("a user connected with ID:", socket.id)
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