import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import dotenv from "dotenv"
import { Readable } from 'stream';

dotenv.config({
    path: '././.env'
})

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

 const uploadOnCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

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