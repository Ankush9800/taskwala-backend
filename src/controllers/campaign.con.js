import { asyncHandler } from "../utils/asynchandler.js";
import { Campaign } from "../models/campaign.model.js";
import { Submission } from "../models/submission.model.js"
import { deleteCampaignImage, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { response } from "express";
import { Postback } from "../models/postback.model.js";
import { Icd } from "../models/icd.model.js";

const newCampaign = asyncHandler(async(req, res)=>{
    const {title, payoutRate, trackingUrl, description, stepsToFollow, provider, campId} = req.body

    if ([title, payoutRate, trackingUrl, description, stepsToFollow, provider, campId].some((field)=>{
        field?.trim()===""
    })) {
        console.log("all field required when creating new campaign")
    }

    const campaignImagePath = req.file?.path
    if (!campaignImagePath) {
        console.log("campaign Image upload failed")
    }

    const campaignImage = await uploadOnCloudinary(req.file.buffer)

    if (!campaignImage) {
        console.log("campaign Image upload failed");
    }

    const campaign = await Campaign.create({
        title,
        campId,
        payoutRate,
        trackingUrl,
        description,
        stepsToFollow,
        campaignImage: campaignImage?.url,
        imgPubid: campaignImage.public_id,
        provider,
    })

    const createdCampaign = await Campaign.findById(campaign._id)

    if (!createdCampaign) {
        console.log("server error while creating campaign");
        return res.status(500).json(new ApiResponse(500, null, "server error while creating campaign"))
    }
    
    console.log("campaign created successfully")

    return res.status(201).json(new ApiResponse(201, createdCampaign, "campaign created successfully"))
})

const updateCampaign = asyncHandler(async(req, res)=>{
    const id = req.params.id
    const {title, payoutRate, trackingUrl, description, stepsToFollow, provider, campId} = req.body

    if ([title, payoutRate, trackingUrl, stepsToFollow, provider].some(field => field?.toString().trim() === "")) {
    return res.status(400).json(new ApiResponse(400, null, "Required fields are missing"));
    }

    let campaignImage

    if (req.file?.buffer) {
        campaignImage = await uploadOnCloudinary(req.file?.buffer)
    }

    if (campaignImage) {
        const {imgPubid} = await Campaign.findById(id)
        deleteCampaignImage(imgPubid)
    }

    const campaign = await Campaign.findByIdAndUpdate(
        id,
        {
            $set:{
                title,
                campId,
                payoutRate,
                trackingUrl,
                description,
                stepsToFollow,
                campaignImage: campaignImage?.url,
                imgPubid: campaignImage?.public_id,
                provider,
            }
        },
        {new:true}
    )
    if (!campaign) {
        console.log("error when updating campaign");
    }
    const updatedCampaign = await Campaign.findById(campaign._id)

    return res.status(200)
    .json(new ApiResponse(200, updatedCampaign, "campaign updated successfully"))
})

const updateCampaignState = asyncHandler(async(req, res)=>{
    const id = req.params.id
    const {campaignStatus} = req.body

    const campaign = await Campaign.findByIdAndUpdate(
        id,
        {
            $set:{
                campaignStatus,
            }
        }
    )
    if (!campaign) {
        return res.status(404)
        .json(new ApiResponse(404,"", "error updating campaign status"))
    }

    return res.status(200).json(new ApiResponse(200,"", "Campaign status updated successfully"))
})

const getallcampaign = asyncHandler(async(req, res)=>{
    const campaigns =await Campaign.find()
    res.status(200).json(campaigns)
})

const getCampaignBiId = asyncHandler(async(req, res)=>{
    const id = req.params.id

    const campaign = await Campaign.findById(id)

    if (!campaign) {
        return res.status(404).json(new ApiResponse(404,"","Error while finding campaign"))
    }

    return res.status(200).json(new ApiResponse(200, campaign, "successfully get campaign"))
})

const submitCampaign = asyncHandler(async(req, res)=>{
    const {phone, upi, cName, redirectUrl, payoutRate, provider} = req.body

    if ([phone, upi, cName, redirectUrl, payoutRate, provider].some(field => field?.toString().trim() === "")) {
    return res.status(400).json(new ApiResponse(400, null, "Required fields are missing"));
    }

    let finalUrl = ""

    if (provider === "hiqmobi") {
        let params = new URLSearchParams({
            p1 : phone,
            p2 : upi,
            p3 : cName,
        })
        finalUrl = `${redirectUrl}?${params.toString()}`
    }else if (provider === "sankmo") {
        let params = new URLSearchParams({
            subid1 : phone,
            subid2 : upi,
        })
        finalUrl = `${redirectUrl}&${params.toString()}`
    }else if (provider === "icd") {
        let params = new URLSearchParams({
            aff_sub1 : phone,
            aff_sub2 : upi,
            aff_sub3 : cName,
        })
        finalUrl = `${redirectUrl}&${params.toString()}`
    }

    const submission = await Submission.create({
        phone,
        upi,
        cName,
        redirectUrl : finalUrl,
        payoutRate,
    })

    const createdSubmission = await Submission.findById(submission._id)

    if (!createdSubmission) {
        console.log("server error while submitting campaign");
        return res.status(500).json(new ApiResponse(500, null, "server error while submitting campaign"))
    }

    console.log("campaign submitted successfully");

    setTimeout(()=>{
        return res.status(201).json(new ApiResponse(201, createdSubmission, "campaign submitted successfully"))
    },2000)
    
})

const deleteCampaign = asyncHandler(async(req, res)=>{
    const {id} = req.params

    const campaign = await Campaign.findByIdAndDelete(id)
    
    if (campaign) {
        deleteCampaignImage(campaign.imgPubid)
    }

    if (!campaign) {
        return res.status(404)
        .json(new ApiResponse(404, campaign, "campaign not found"))
    }

    return res.status(200)
    .json(new ApiResponse(200, campaign, "campaign deleted successfully"))
})

const getAllSubmission = asyncHandler(async(req, res)=>{

    const pageLimit = 10
    const page = parseInt(req.query.page) || 1
    const skip = (page -1)*pageLimit

    const [submission, totalCount] = await Promise.all([Submission.find().sort({createdAt : -1}).limit(pageLimit).skip(skip), Submission.countDocuments()])
    return res.status(200).json(new ApiResponse(200,[submission, totalCount],"Successfully recovered all submission"))
})

const getHiqmobiConversion = asyncHandler(async(req, res)=>{
    const page = req.query.page || 1

    const api = `https://api.hiqmobi.com/api/conversion?api_token=15t01kbcjzi35of3ua1j55eilvpkwtboqi6i&page=${page}&limit=10`

    try {
        const response = await fetch(api)
        const data = await response.json()
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json(error)
    }
})

const postbackUrl = asyncHandler(async(req, res)=>{
    
    const {click_id, sub_aff_id, ip, aff_sub1, aff_sub2, aff_sub3, payout, event_token, provider} = req.query

    let updatedPayout = 0

    if (typeof payout === "number") {
        updatedPayout = payout
    }
       
    const conversion = await Postback.create({
        clickId : click_id,
        campId : sub_aff_id,
        ip : ip,
        phoneNo : aff_sub1,
        upiId : aff_sub2,
        cName : aff_sub3,
        payout : updatedPayout,
        goal : event_token,
        provider,
    })

    const createdConversion =await Postback.findById(conversion._id)

    if (!createdConversion) {
        console.log("server error while submitting conversion");
        return res.status(500).json(new ApiResponse(500, null, "server error while submitting conversion"))
    }

    return res.status(200).json(new ApiResponse(200,createdConversion,"Successfully recovered conversion")) 
})

const getHiqmobiPostback = asyncHandler(async(req, res)=>{

    const pageLimit = 10
    const page = req.query.page
    const skip = (page-1)* pageLimit
    const [postback, totalCount] = await Promise.all([Hiqmobi.find().sort({createdAt : -1}).limit(pageLimit).skip(skip), Hiqmobi.find({payout:{ $gt: 0 }}).countDocuments()])
    return res.status(200).json(new ApiResponse(200,[postback, totalCount],"Successfully recovered all postback"))
})

const getHiqmobiUserPostback = asyncHandler(async(req, res)=>{

    const {upiid, campid} = req.query

    if (!(upiid && campid)) {
    return res.status(400).json(new ApiResponse(400, null, "Phone number is required"));
    }

    const postback = await Hiqmobi.find({upiId : upiid, campId :campid})

    if (!postback) {
    return res.status(400).json(new ApiResponse(400, null, "No data found"));
    }

    return res.status(200).json(new ApiResponse(200,postback,"Successfully recovered postback"))
})

const getActiveCampaigns = asyncHandler(async(req, res)=>{
    const campaigns = await Campaign.find({campaignStatus : true})
    res.status(200).json(campaigns)
})

const indiancampaignPostback = asyncHandler(async(req, res)=>{
    const {offerid, aff_sub1, aff_sub2, aff_sub3, event_name} = req.query

    const conversion = await Icd.create({
        campId : offerid,
        phoneNo : aff_sub1,
        upiId : aff_sub2,
        cName : aff_sub3,
        goal : event_name
    })

    const createdConversion =await Icd.findById(conversion._id)

    if (!createdConversion) {
        console.log("server error while submitting conversion");
        return res.status(500).json(new ApiResponse(500, null, "server error while submitting conversion"))
    }

    return res.status(200).json(new ApiResponse(200,createdConversion,"Successfully recovered conversion"))
})

    
export {newCampaign, updateCampaign, getallcampaign, submitCampaign, deleteCampaign, updateCampaignState, getCampaignBiId, getAllSubmission, getHiqmobiConversion, postbackUrl, getHiqmobiPostback, getHiqmobiUserPostback, getActiveCampaigns, indiancampaignPostback}