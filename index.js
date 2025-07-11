import dotenv from "dotenv"
import connectdb from "./src/db/mongodb.js"
import { app } from "./app.js"

dotenv.config({
    path : '.env'
})

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("mongodb connection failed", error)
})