
// import cloudinary from "cloudinary";
// // import { CloudinaryStorage } from "multer-storage-cloudinary";
// const multer = require("multer");

// // import multer from "multer";
// // Import necessary modules
// import dotenv from "dotenv";
// dotenv.config(); // Load environment variables from .env file
// // require("dotenv").config();
// // console.log("Cloudinary Config:", process.env.CLOUDINARY_CLOUD_NAME);
// // console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
// // console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET);

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure Multer Storage for Images
// const helpingImageStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "helping_images", // Folder in Cloudinary for
//     format: async (req, file) => "png", // Convert all images to PNG
//     public_id: (req, file) => `helping-${Date.now()}-${file.originalname}`, // Unique filename
//   },
// });
// // cloudinary.v2.uploader.upload("b1.jpeg", (error, result) => {
// //   if (error) console.error("Cloudinary error:", error);
// //   else console.log("Uploaded!", result);
// // });

// // Configure Multer Storage for Profile Images
// // const profileImageStorage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //     folder: "profile_images", // Folder in Cloudinary for profiles
// //     format: async (req, file) => "png", // Convert all images to PNG
// //     public_id: (req, file) => `profile-${Date.now()}-${file.originalname}`, // Unique filename
// //   },
// // });

// // Create Multer Upload Handlers
// export const helpingImageUpload = multer({ storage: helpingImageStorage });

// // const uploadProfileImage = multer({ storage: profileImageStorage });

// // module.exports = { uploadBlogImage, uploadProfileImage, cloudinary };

// // export { uploadHelpingImage };



// middlewares/upload.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for helping images
const helpingImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "helping_images",
    format: async (req, file) => "png",
    public_id: (req, file) => `helping-${Date.now()}-${file.originalname}`,
  },
});

const helpingImageUpload = multer({ storage: helpingImageStorage });

export { helpingImageUpload };

