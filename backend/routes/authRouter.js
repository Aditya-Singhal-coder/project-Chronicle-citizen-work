import express from "express";
import { Login, register } from "../controller/authController.js";

const router = express.Router();

router.get("/login",Login);
router.get("/register",register);

export default router;