import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        credentials:true
    }
))


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))// we url insert + or %20 for space to eliminate it we user urlencoder
app.use(express.static("public"))
app.use(cookieParser())


// routes

import  userRouter from './routes/user.routes'


// routes declaration

// app.use('/users',userRouter); // http://localhost:8000/users/register
// standard practice
app.use('/api/v1/users',userRouter); // http://localhost:8000/api/v1/users/register

export { app }