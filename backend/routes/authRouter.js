import express from "express";
import {registerUser, loginUser , logoutUser,
     refresAccessToken,changeCurrentPassword,updateAccountDetail} from "../controller/authController.js"
import {verifyJwt} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)


// middleware ko generally hum router likhte samay use krte h
router.route("/logout").post(verifyJwt , logoutUser);

// ek end point hit krne pr access token dubara user ko dedo on expire the current access token
router.route("/refresh-token").post(refresAccessToken);

// route for change password and update detail
router.route("/change-password").post(verifyJwt,changeCurrentPassword);
router.route("/update-detail").post(verifyJwt,updateAccountDetail);

export default router;