import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import dotenv from "dotenv"

dotenv.config({
    path: '././.env'
})

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

 const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:'auto'
            }
        )
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("failed toupload")
        fs.unlinkSync(localFilePath)  //remove the temporary file if operation got failed
        return null;
    }
 }

 const getAssetCloudinary =async ()=>{
    try {
        const response = await cloudinary.api.resource("sample/mobile-min_yfg0yo")
    } catch (error) {
        console.log(error)
    }
 }

//  getAssetCloudinary()

 const deleteCampaignImage = async(pub_id)=>{
    try {
        const response = await cloudinary.uploader.destroy(pub_id,{
            resource_type:"image"
        })
    } catch (error) {
        console.log(error)
    }
 }

 export {uploadOnCloudinary, getAssetCloudinary, deleteCampaignImage}