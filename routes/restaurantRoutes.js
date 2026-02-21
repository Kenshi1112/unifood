const express = require('express');
const router = express.Router();

// Controllers
const {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

// Middleware
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Include other resource routers
const menuRouter = require('./menuRoutes');

// Re-route into other resource routers
router.use('/:restaurantId/menu', menuRouter);

/**
 * @route   GET /api/restaurant
 * @desc    Get all restaurants
 * @access  Public
 */
router.get('/', getRestaurants);

/**
 * @route   POST /api/restaurant
 * @desc    Create new restaurant
 * @access  Private (Admin)
 */
router.post(
  '/',
  protect,
  upload.single('image'), // <input type="file" name="image" />
  createRestaurant
);

/**
 * @route   GET /api/restaurant/:id
 * @desc    Get single restaurant by ID
 * @access  Public
 */
router.get('/:id', getRestaurant);

/**
 * @route   PUT /api/restaurant/:id
 * @desc    Update restaurant
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  protect,
  upload.single('image'),
  updateRestaurant
);

/**
 * @route   DELETE /api/restaurant/:id
 * @desc    Delete restaurant
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  protect,
  deleteRestaurant
);

module.exports = router;
