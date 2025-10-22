import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import {User} from "../models/userModel.js"


export const verifyJwt = asyncHandler( async(req , res , next)=>{
    try {
        // get access token from cookie or from header, and trim any whitespace (like the space after "Bearer ")
        const token = (req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "") || "").trim()
        
        if(!token){
            throw new ApiError(401 , "Unauthorized request: Token missing")
        }

        // use jwt to verify the token against the ACCESS_TOKEN_SECRET
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the decoded ID, excluding sensitive fields
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            // Token was valid, but user doesn't exist (e.g., account deleted)
            throw new ApiError(401 , "Invalid Access Token: User not found")
        }

        // Attach the user object to the request for the next middleware/controller
        req.user = user;
        next(); 
    } 
    catch (error) {
        // Catch verification errors (e.g., 'jwt expired', 'invalid signature')
        throw new ApiError(401 , error?.message || "Invalid Access Token")
    }
} )
