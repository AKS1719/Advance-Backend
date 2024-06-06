// require('dotenv').config({path:'./env'}) // it drags the consistency of code as require and import 


import dotenv from "dotenv"
import connectDB from "./db/db1.js";
import { app } from './app.js'


dotenv.config({
    path:'./.env'
})


// we are not returning anything but our async method always returns a promise 
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`app running in http://localhost:${process.env.PORT}`)
    })
    app.on("error",(err)=>{
        console.log(err);
        throw err;
    })
})
.catch((errr)=>{
    console.log("Mongo Db connection failed !!",errr)
})






// function connectDB(){}
// connectDB()
/*
import express from 'express'

const app = express();

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',(err)=>{
            console.log(err);
            throw err
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error ",error);
    }
})()
*/