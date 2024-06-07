import { Router } from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';


const router = Router();

// router.route("/register").post(registerUser)
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",// will be same on the frontend and the backend
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

// secured routes 

// router.route('/logout').post(verifyJWT,anothermiddleware which has next,logoutUser) // after completion it will transfoer to the logout
router.route('/logout').post(verifyJWT,logoutUser)

export default router;