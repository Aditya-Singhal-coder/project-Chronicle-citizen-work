import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/userModel.js"; // User is directly connect with db
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { use } from "react";

// function for generate access and refresh token while login
const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const  userToken = await User.findById(userId);
        const accessToken = userToken.generateAccessToken();
        const refreshToken = userToken.generateRefreshToken();
// access token hum user ko de dete h
// but refresh token ko hum db me bhi rakhte h

        userToken.refreshToken = refreshToken;
        await userToken.save({validateBeforeSave: false}); // to save the refresh token

        return {accessToken , refreshToken};

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating access and refresh token");
    }
}

// web request ke liye asyncHandler ka use krenge

const registerUser = asyncHandler( async (req,res) =>{
    // what we need for register user

    // first we need user detail(depend on userModel) for sure (from frontened)
    // second we will check for validation of credentials of user
    // some steps come here when we also need photo or videos
    // third check if user already exist or not (userName , email)
    // fourth create user object to create entry in db
    // 5 remove password from response to frontened
    // 6 check if response or user creation
    // return res or send err

    // 1....
    const {userName , email, password , role} = req.body;
        console.log("email" , email);

    // 2...validation
    if (
        [userName, email, password, role].some(
            (field) => !field || field.trim() === ""
        )
    )
    {
        throw new ApiError(400, "All fields are required");
    }


     // Simple regex for email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        throw new ApiError(400 , "Invalid email format");
    }
    
    // 3......... user already exist or not
    const existedUser = await User.findOne({
        $or: [{ userName } , { email }]
    })
    if(existedUser){
        throw new ApiError(409 , "User witn username or email already exist"); 
        // agr ApiiError n hota to baar baar res.status().json({}) likhna padta
    }

    // 4........ create user object- entry in db
    // db se baat bs User kr rha h
    const newUser = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        role: role || 'Citizen' // Default to 'Citizen' if role is not supplied
    })
    // 5......
    const createdUser = await User.findById(newUser._id).select(
        "-password" // yaha vo likhte h jo frontened me nhi dikhana hota
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 6.......
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )

});


const loginUser = asyncHandler( async(req,res)=>{
    // login krte smy we will use refresh and access token

    // FIRST take the user credentials like email and passwrod from req.body
    // second.. verify the user credentials {email or username}
    // third.. find the user
    // fourth password check
    // fifth generate access and refresh token
    // sixth send the token in cookies

    // 1..
    const {userName , email, password} = req.body;

    // 2......
    if( !(userName || email) ){
        throw new ApiError(400 , "username or email is required");
    }

    // 3......
    const user = await User.findOne(
        {
            $or: [{userName} , {email}]
        }
    ).select('+password');  // .select() is must....
 
    if(!user){
        throw new ApiError(404 , "user does not exist");
    }

    // 4...  bcrypt will help to verify the password
    const isPasswordValid = await user.isPasswordCorret(password)
    if(!isPasswordValid){
        throw new ApiError(401 , "passsword is not correct");
    }

    // 5..... access and refresh token
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    // 6..... cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,   // done so that only server can modify the cookies
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
} );


// logout......

const logoutUser = asyncHandler(async(req,res)=>{
    // cookies and refresh token ko remove krna h
    // pr ye kis user se lena h mtlb user id nhi h abhi 
    // we will need a middleware here (design by ourself)
    
    // now ab hum middleware exexute krane ke baad yaha pahuche h
    // means we have access of req.user like req,body
    // ye sab bs user ki id ke liye ho rha jisse uske through tokens delete kr sake

    await User.findByIdAndUpdate( 
        req.user._id,
        {
            $set: {
                refreshToken: undefined // refresh token database se gayab kr diya
            }
        },
        {
            new: true
        }
    )

    // need to remove cookies from db
     // ccolies ke liye options chahiye menas only server can modify
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json( new ApiResponse(200 , {} , "User logged Out"));

})


// ek end point hit krne pr access token dubara user ko dedo on expire the current access token

const refresAccessToken = asyncHandler(async(req,res)=>{
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // get from user
    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorised request");
    }

    // need to verify the incoming refresh token with the one in db
    // use jwt to decode the incoming refresh token because user ke paas encrypted form me token hote h

    try {
        const decodeRefreshToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
     
        const user  = await User.findById(decodeRefreshToken?._id);
        if(!user){
            throw new ApiError(401, "invalid user");
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "Refresh token is expired or used");
        }

        // now generate the new access token
        // cookies me bhejne h to options bhi bnane padenge
        const options = {
            httpOnly: true,
            secure: true
        }

        // already made an method above to generate token
        const {refreshToken , accessToken} = await generateAccessAndRefreshToken(user?._id);

        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export  {
    loginUser,
    registerUser,
    logoutUser,
    refresAccessToken
}