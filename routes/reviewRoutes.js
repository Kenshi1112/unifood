const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// @route   POST /api/review
router.post('/', reviewController.addReview);
router.get('/me', reviewController.getUserReviews); // ต้องอยู่ก่อน /:restaurantId
router.get('/:restaurantId', reviewController.getReviews);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;