const express = require('express');
const {
  getMenus,
  addMenu,
  deleteMenu
} = require('../controllers/menuController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getMenus)
  .post(protect, upload.single('image'), addMenu);

router.route('/:id')
  .delete(protect, deleteMenu);

module.exports = router;