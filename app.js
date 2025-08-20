import  express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "https://twcampaign.in", "https://taskwala.netlify.app"],
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import campaignRouter from "./src/routes/campaign.rout.js"
import adminRouter from "./src/routes/admin.rout.js"

app.use("/campaign", campaignRouter)
app.use("/admin", adminRouter)

export {app}