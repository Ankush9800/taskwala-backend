import mongoose from "mongoose";

const connectdb = async()=>{
    try {
        const databaseconnection = await mongoose.connect(`${process.env.MONGODB_URI}/Campaigns`)
        console.log("detabase connected at", mongoose.connection.host);
        
    } catch (error) {
        console.log("mongodb connection failed", error)
    }
}

export default connectdb;