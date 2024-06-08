import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {newTweet} = req.body

    if(!newTweet){
        throw new ApiError(404,"Tweet missing")
    }

    const tweetCreated = await Tweet.create(
        {
            owner: req.user?._id,
            content:newTweet
        }
    )

    if(!tweetCreated){
        throw new ApiError(500,"Something went wrong while uploading the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tweetCreated},
            "Tweet Creation succesfull"
        )
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"The user id is wrong")
    }
    
    const tweets = await Tweet.aggregate([
        {
            $match :{
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as : "user"
            }
        },
        {
            $project:{
                content:1
            }
        }
    ])
    if(!tweets?.length){
        throw new ApiError(404,"User do not have any Tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets[0],
            "Tweets found succesfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}