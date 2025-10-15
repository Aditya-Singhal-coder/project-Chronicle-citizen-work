import express, { Router } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRouter.js";

// dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/" , (req,res)=>{
    res.send("API is running...");
});

app.use("/auth",authRouter)

// need to put some data in dotenv file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`))
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
//   .catch(err => console.log(err));