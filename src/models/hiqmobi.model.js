import mongoose, {Schema} from "mongoose";

const hiqmobiSchema = new Schema({
    clickId:{
        type : String,
    },
    campId:{
        type : String,
    },
    phoneNo:{
        type : String,
    },
    upiId:{
        type : String,
    },
    cName:{
        type : String,
    },
    payout:{
        type : Number
    },
    goal:{
        type : String
    },
},{timestamps : true})

export const Hiqmobi = mongoose.model("Hiqmobi", hiqmobiSchema)