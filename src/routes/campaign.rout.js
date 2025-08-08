import { Router } from "express";
import {deleteCampaign, getActiveCampaigns, getallcampaign, getAllSubmission, getCampaignBiId, getHiqmobiConversion, getHiqmobiPostback, getHiqmobiUserPostback, indiancampaignPostback, newCampaign, postbackUrl, submitCampaign, updateCampaign, updateCampaignState } from "../controllers/campaign.con.js";
import {upload} from "../middleware/multer.middleware.js"

const router = Router()

router.route("/newcampaign").post(upload.single("campaignImage"), newCampaign)
router.route("/updatecamp/:id").post(upload.single("campaignImage"),updateCampaign)
router.route("/getallcampaign").get(getallcampaign)
router.route("/submitcampaign").post(submitCampaign)
router.route("/deletecampaign/:id").post(deleteCampaign)
router.route("/updatecampstatus/:id").post(updateCampaignState)
router.route("/getcampaignbyid/:id").get(getCampaignBiId)
router.route("/getallsubmission").get(getAllSubmission)
router.route("/gethiqmobidata").get(getHiqmobiConversion)
router.route("/postback").get(postbackUrl)
router.route("/icdpostback").get(indiancampaignPostback)
router.route("/getpostback").get(getHiqmobiPostback)
router.route("/userpostback").get(getHiqmobiUserPostback)
router.route("/activecampaigns").get(getActiveCampaigns)

export default router