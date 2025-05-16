const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp"); // Import sharp

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Delete an existing image from S3
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise
 */
const deleteExistingImage = async (imageUrl) => {
  try {
    // Check if imageUrl exists and is a valid S3 URL
    if (!imageUrl) return false;

    // Extract the key from the URL
    // Example URL: https://bucket-name.s3.region.amazonaws.com/store/filename.jpg
    const urlParts = imageUrl.split("/");
    if (urlParts.length < 4) return false;

    // Get the key starting from the 'store/' part
    const key = urlParts.slice(3).join("/");

    if (!key) return false;

    // Create delete command
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    // Execute delete command
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    console.log(`Successfully deleted image: ${key}`);
    return true;
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    return false;
  }
};

const generateRandomAlphanumericString = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${generateRandomAlphanumericString()}.webp`; // Save as .webp
      cb(null, "store" + req.params.storeId + "/" + fileName);
    },
    shouldTransform: true, // Enable transformation
    transforms: [
      {
        id: "webp",
        transform: (req, file, cb) => {
          cb(null, sharp().webp()); // Convert to webp
        },
      },
    ],
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});
const uploadPaymentImg = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `payment-${req.params.payid}.webp`; // Save as .webp
      cb(null, "store" + req.params.storeId + "/" + fileName);
    },
    shouldTransform: true, // Enable transformation
    transforms: [
      {
        id: "webp",
        transform: (req, file, cb) => {
          cb(null, sharp().webp()); // Convert to webp
        },
      },
    ],
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

module.exports = { s3, upload, uploadPaymentImg, deleteExistingImage };
