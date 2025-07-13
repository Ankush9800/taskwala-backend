import { Router } from "express";
import {deleteCampaign, getallcampaign, getAllSubmission, getCampaignBiId, getHiqmobiConversion, hiqmobiPostBackUrl, newCampaign, submitCampaign, updateCampaign, updateCampaignState } from "../controllers/campaign.con.js";
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
router.route("/postback").get(hiqmobiPostBackUrl)

export default router