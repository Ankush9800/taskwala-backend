import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        
        if (!token) {
            console.log("hare is the problem 111")
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized request"));
        }
        
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken")
        
        if (!admin) {
            return res.status(401).json(new ApiResponse(401, null, "Invailed accesstoken"));
        }
    
        req.admin = admin;
        next()
    } catch (error) {
        return res.status(401).json(new ApiResponse(401, null, "auth.middleware problem"));
    }
})

export {verifyJWT}