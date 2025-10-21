import express from "express";
import {registerUser, LoginUser} from "../controller/authController.js"

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login")


export default router;