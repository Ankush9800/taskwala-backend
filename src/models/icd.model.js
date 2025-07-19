import mongoose,{Schema} from "mongoose";

const icdSchema = new Schema({
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

export const Icd = mongoose.model("Icd", icdSchema)