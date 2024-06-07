import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.GenerateAccessToken()
        const refreshToken = user.GenerateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save(
            { validateBeforeSave: false }
        )
        // console.log("functoin",acessToken)
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // step 1:  get user details from frontend
    // setp 2: validation of user details  (not empty)
    // step 3: check if user already exists : username or email
    // step 4: check for images , check for avatar
    // step 5: upload them to cloudnery
    // step 6: create user object - create entry in db 
    // step 7: remove password and refresh token fiel from response
    // step 8: check for user creation
    // step 9: return reponse


    const { fullName, email, username, password } = req.body;
    // console.log(fullName,email,username,password)

    // if(fullName===""){
    //     throw new ApiError(400,"Full Name is Required")
    // }

    if ([fullName, email, username, password].some((feild) => feild?.trim === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        // $or will find any means if username exists it will give username or if email is present it will give the usernam
        // likewise we have many operators liek $and etc 
        $or: [{ username }, { email }]
    })

    // console.log(existedUser)
    if (existedUser) {
        throw new ApiError(409, "User with email or username already Exists!")
    }

    // console.log("usercontroller req.files ",req.files)
    // same nam
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar local file is required")
    }

    // uploading on cloudinary 

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar)
    if (!avatar) {

        throw new ApiError(400, "Avatar file is required")
    }

    // database entry

    const user = await User.create(
        {
            fullName: fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            username: username.toLowerCase(),
            email: email,
            password: password
        }
    )

    // check if user is created or not 
    // in select we pass the feilds which we don't want to take in our createduser variable rest others are selected by default
    // syntax is -{field name}
    const createdUser = await User.findById((user._id)).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    /**
     * step 1: getting user details
     * step 2: validation of user details
     * step 3: check if user exists
     * step 4: check the password
     * step 5: access and refresh token generation
     * step 6: send cookie
     */

    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or password is required")
    }

    const user = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )

    if (!user) {
        throw new ApiError(404, "User Does not exist")
    }

    // the methods which we are define in the userschema that should be called using small letters only 
    // we are creating the instance so use the instance of the User
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id);

    // console.log(userExist)
    const loggedInUser = await  User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options= {
        // by default the cookies in the browser are modified using frontend but using httpOnly makes the cookies changeable only by the server
        httpOnly:true,
        secure:true
    }

    // this will set the cookies 
    // console.log("login   : ",accessToken,refreshToken)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const logoutUser = asyncHandler(async (req,res)=>{
    /**
     * we can't do logout by clearing the database reference token field as we don't have acess to the user data for now as 
     * we can't show a popup to fill the details of the user at the time of logout 
     * 
     * 
     * In this case we can clear the browser cookies to make it happen
     */

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined,
            }
        },
        {
            new:true
        }
    )

    
    const options= {
       
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,"User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newrefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh token")
    }
    
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
 };