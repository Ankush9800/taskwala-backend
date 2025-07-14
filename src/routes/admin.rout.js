import { Router } from "express";
import { getAdmin, loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.con.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/createadmin").post(upload.single("avatar"),registerAdmin)
router.route("/adminlogin").post(loginAdmin)
router.route("/adminlogout").get(verifyJWT,logoutAdmin)
router.route("/getadmin").get(verifyJWT,getAdmin)

export default router