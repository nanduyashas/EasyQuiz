// backend/routes/AdmProfileRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { auth, adminOnly } = require('../middlewere/authMiddleware');
const adminProfileController = require('../controllers/adminProfileController');

// Multer setup (saves to backend/uploads)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// GET admin profile
router.get('/', auth, adminOnly, adminProfileController.getAdminProfile);

// UPDATE name + image (optional)
router.put('/update', auth, adminOnly, upload.single('profileImage'), adminProfileController.updateAdminProfile);

// UPDATE only image
router.put('/update-image', auth, adminOnly, upload.single('profileImage'), adminProfileController.updateProfileImage);

// ✅ FIX: REMOVE IMAGE SHOULD BE DELETE NOT PUT
router.delete('/remove-image', auth, adminOnly, adminProfileController.removeProfileImage);

// CHANGE PASSWORD
router.put('/change-password', auth, adminOnly, adminProfileController.changeAdminPassword);

// DELETE ACCOUNT
router.delete('/delete-account', auth, adminOnly, adminProfileController.deleteAdminAccount);

module.exports = router;
