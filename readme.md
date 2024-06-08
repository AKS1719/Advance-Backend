# Complete Backend

[Model Link]([youtube backend — Eraser](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj))

This backend is made in taking a picture data from <h3> <h4> `Chai and Code`

![1717862154730](images/readme/1717862154730.png)

## Steps for creating the backend

- Connecting Database
- Utility (Custom Errors & Custom Response)
- Middlewares
- Database models ( user , video ,  tweet, subscription , playlist , like, comment )
- Creating routes
- Using jwt for tokens and cookies
- Using multer to upload files
- Controllers (Logic for each models)
- Generate Refresh and access Token
- Completing each model Controllers
- MongoDB aggregation Piplene

## Knowledege of HTTP Headers

![1717862487114](images/readme/1717862487114.png)

## Connecting Database

Connecting the database is very important without using a database we can't store anything

#### Steps

- Goto mongodb Atlas
- Create a project
- Create Cluster
- Take the connection String
- Put it in the .env file
- Use the connection string to connect to the database

## Utilities

### Custom Errors utility

Creating a custom error utility helps us to throw the error very easily and in owr own way which make it easy to the frontend team to check for the errors

### Custome Response utility

Creating a custom reponse utility helps us to send a response in our custom way which is very beneficial with co-operating with the frontend team

### Asynchandler utility

Asynchandler utility is very important to by default handle the try and catch block and we don't need to bother for the try and catch functionality

### Cloudinary Utility

This utility provides us the feature of uploading the images and video files to the cloudinary and provide the link for the same

## Middlewares

### Auth middleware

Auth middleware Verifies the user if the user is logged in or logged out by using cookies and JWT that is json web tokens through which it generates the the Refresh and the Access Tokens

- #### Refresh Token

  - Refresh Token are the long lived token
  - That means they have long expiration dates
  - These are the tokens helpful for the user to browse stuff without entering their email and password again and again
- #### Access Token

  - Access Token are short lived token
  - That means they have short expiration datas
  - These token are only verifies the user when it requres authentication types of stuff

#### Earlier only the access tokens were their but then google propose the tow token scheme in its research paper

### Multer middleware

Multer middleware uses multer lilbarary which helps to upload the files from the user end and push it to the server end

## Models

### User model

It has several fields

- username (String)
- email (string)
- fullName(String)
- avatar(String)
- coverImage(String)
- watchHistory(Array of objects of video model)
- password(String)
- refreshToken(string)
- createdAT (timestamps)
- updatedAt (timestamps)

### Video model

- videofile (String)
- thumnails (string)
- title (string)
- description (string)
- duration (String)
- views (String)
- isPusblished (boolean)
- owner (reference of user model)

### Comment Model

- content (string)
- video (Reference of video model)
- owner (Reference of user model)

### Like model

- video (reference of video model)
- comment (reference of comment model)
- tweet (reference of tweet model)
- likedBy (reference of user model)

### Playlist model

- name (String)
- description (String)
- videos (reference of video model)
- owner (reference of user model)

### Subscription model

- subscriber (reference of user model)
- channel (reference of user model)

### Tweet model

- owner (reference of user model)
- content (string)

## Routes

Routes are very important

This are the only things which makes the backend accessible to the frontend

### User routes

- /register
- /login
- /logout
- /refresh-token
- /change-password
- /current-user
- /update-account
- /avatar
- /coverImage
- /c:username
- /history

### Comment routes

- /:videoId
- /c/:commentId

### Dashboard routes

- /stats
- /vidoes

### Like routes

- /toggle/v/:videoId
- /toggle/c/:commentID
- /toggle/t/:tweetId
- /vidoes

### Playlist rooutes

- /
- /:playlistId
- /add/:videoId/:playlistId
- /remove/:videoId/:playlistId
- /user/:userId

### Subscription routes

- /c/:channelId
- /u/:subcriberId

### Tweet routes

- /
- /user/:userId
- /:tweetId

### Video Routes

- /
- /:videoId
- /toggle/publish/:videoId

## Controllers

Controllers are the logic for each routes

### User controller

- registerUser
- loginUser
- logoutUser
- refreshAccessToken
- changeCurrentPassword
- getCurrentUser
- updateAccountDetails
- updateUserAvatar
- updateUserCoverImage
- getUserChannel Profile
- getWatchHistory

### Comment controller

- getVideoComments
- addComment
- updateComment
- deleteComment

### Dashboard controller

- getChannelStats
- getChannelVideos

### Like controller

- toggleVideoLike
- toggleCommentLike
- toggleTweetLike
- getLikedVideos

### Playlist Controller

- createPlaylist
- getUserPlaylist
- getPLaylistById
- addVideoFromPlaylist
- deletePlaylist
- updatePlaylist

### Subscription controller

- toggleSubscription
- getUserChannelSubscribers
- getSubscribedChannels

### Tweet controller

- createTweet
- getUserTweets
- updateTweet
- deleteTweet

### Video controller

- getAllVideos
- publishAVideo
- getVideoById
- updateVideo
- deleteVideo
- togglePublishStatus

## Configuration of the app

```javascript
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))// we url insert + or %20 for space to eliminate it we user urlencoder
app.use(express.static("public"))
app.use(cookieParser())


// routes

import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
// routes declaration

// app.use('/users',userRouter); // http://localhost:8000/users/register
// standard practice
app.use('/api/v1/users', userRouter); // http://localhost:8000/api/v1/users/register
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export { app }
```


## Configuration of index 

```javascript
import dotenv from "dotenv"
import connectDB from "./db/db1.js";
import { app } from './app.js'


dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`app running in http://localhost:${process.env.PORT}`)
        })
        app.on("error", (err) => {
            console.log(err);
            throw err;
        })
    })
    .catch((errr) => {
        console.log("Mongo Db connection failed !!", errr)
    })

```
