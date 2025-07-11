import { asyncHandler } from "../utils/asynchandler.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/apiresponse.js";


const generateAccessAndRefreshToken = async(adminId)=>{
    try {
        const admin = await Admin.findById(adminId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({validateBeforeSave: false})
        return{accessToken, refreshToken}

    } catch (error) {
        console.log("generateAccessAndRefreshToken error");
        
    }
}

const registerAdmin = asyncHandler(async(req, res)=>{
    const {fullName, userName, email, phoneNo, password} = req.body

    if ([fullName, userName, email, phoneNo, password].some(field => field?.toString().trim() === "")) {
        return res.status(400).json(new ApiResponse(400, null, "Required fields are missing"));
    }

    const existedAdmin = await Admin.findOne({
        $or:[{email},{userName},{phoneNo}]
    })

    if (existedAdmin) {
        return res.status(409).json(new ApiResponse(409, null, "admin already exists")); 
    }

    const admin = await Admin.create({
        fullName,
        email,
        phoneNo,
        userName,
        password
    })

    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    if (!createdAdmin) {
        console.log("Server error while register a admin")
        return res.status(500).json(new ApiResponse(500, null, "Server error while registering admin"));
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "User registered successfully")
    )
})

const loginAdmin = asyncHandler(async(req, res)=>{
    const {email, password} = req.body
    if (!email) {
        return res.status(400).json(new ApiResponse(400, null, "Email and password required"));
    }

    const admin = await Admin.findOne({email})

    if (!admin) {
        return res.status(404).json(new ApiResponse(404, null, "admin does not exist"));
    }
    
    const isPasswordValid = await admin.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        return res.status(401).json(new ApiResponse(401, null, "Invalid admin credentials"));
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure:true,
        sameSite: "None"
    }

    return res.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                admin: loggedInAdmin, accessToken, refreshToken
            },
            "admin loggedin successfully"
        )
    )

})

const getAdmin = asyncHandler(async(req, res, next)=>{
    const adminData = req.admin
    return res.status(200).json(new ApiResponse(200, adminData, "Successfully recovered admin data"));
})

const logoutAdmin = asyncHandler(async(req, res)=>{
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
           $set:{
                refreshToken: undefined
           } 
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"))
})

export {registerAdmin, loginAdmin, logoutAdmin, getAdmin}