const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// แจ้งปัญหา (user, storekeeper)
router.post('/', protect, upload.single('image'), issueController.createIssue);

// ดูรายการแจ้งปัญหา (admin)
router.get('/', protect, issueController.getIssues);

module.exports = router;
