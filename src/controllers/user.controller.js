import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    // step 1:  get user details from frontend
    // setp 2: validation of user details  (not empty)
    // step 3: check if user already exists : username or email
    // step 4: check for images , check for avatar
    // step 5: upload them to cloudnery
    // step 6: create user object - create entry in db 
    // step 7: remove password and refresh token fiel from response
    // step 8: check for user creation
    // step 9: return reponse


    const {fullName,email,username,password} = req.body;
    // console.log(fullName,email,username,password)

    // if(fullName===""){
    //     throw new ApiError(400,"Full Name is Required")
    // }

    if ([fullName,email,username,password].some((feild)=> feild?.trim ==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        // $or will find any means if username exists it will give username or if email is present it will give the usernam
        // likewise we have many operators liek $and etc 
        $or: [{username},{email}]
    })

    // console.log(existedUser)
    if(existedUser){
        throw new ApiError(409,"User with email or username already Exists!")
    }

    // console.log("usercontroller req.files ",req.files)
                                    // same nam
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar local file is required")
    }

    // uploading on cloudinary 

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar)
    if(!avatar){
        
        throw new ApiError(400,"Avatar file is required")
    }

    // database entry

    const user = await User.create(
        {
            fullName:fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            username:username.toLowerCase(),
            email:email,
            password:password
        }
    )

    // check if user is created or not 
    // in select we pass the feilds which we don't want to take in our createduser variable rest others are selected by default
    // syntax is -{field name}
    const createdUser = await User.findById((user._id)).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})




export {registerUser};