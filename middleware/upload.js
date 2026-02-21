const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary จะอ่านค่า CLOUDINARY_URL จาก .env โดยอัตโนมัติ

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my-food-app', // ชื่อโฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;