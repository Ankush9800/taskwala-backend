import mongoose, {Schema} from "mongoose";

const postbackSchema = new Schema({
    clickId:{
        type : String,
    },
    campId:{
        type : String,
    },
    ip:{
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
    provider:{
        type :String,
    }
},{timestamps : true})

export const Postback = mongoose.model("Postback", postbackSchema)