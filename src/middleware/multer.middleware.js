import multer from "multer";

const storage = multer.diskStorage({
    // file --> if file is coming cb --> call back
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage: storage /** or just storage, */ })


