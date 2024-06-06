import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';

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

export default router;