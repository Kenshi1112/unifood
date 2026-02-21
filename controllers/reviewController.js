const Review = require('../models/review');
const jwt = require('jsonwebtoken');

// เพิ่มรีวิว
exports.addReview = async (req, res) => {
  try {
    // ตรวจสอบ Token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Please login to review' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const { restaurantId, rating, comment } = req.body;

    const review = await Review.create({
      restaurant: restaurantId,
      user: decoded.id,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ดึงรีวิวของร้านอาหาร
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name') // ดึงชื่อคนรีวิวมาด้วย
      .sort('-createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// แก้ไขรีวิว
exports.updateReview = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Please login to update review' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // ตรวจสอบว่าเป็นเจ้าของรีวิวหรือไม่
    if (review.user.toString() !== decoded.id) {
      return res.status(401).json({ message: 'Not authorized to update this review' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // คำนวณคะแนนเฉลี่ยใหม่
    await Review.getAverageRating(review.restaurant);

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ลบุรีวิว
exports.deleteReview = async (req, res) => {
  try {
    // (Logic การตรวจสอบ Token และเจ้าของรีวิว เหมือน updateReview)
    // ... เพื่อความกระชับ ผมจะใช้ findOneAndDelete โดยใส่เงื่อนไข user ไปด้วยเลย
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const review = await Review.findOneAndDelete({ _id: req.params.id, user: decoded.id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or user not authorized' });
    }

    // คำนวณคะแนนเฉลี่ยใหม่
    await Review.getAverageRating(review.restaurant);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงรีวิวของ User (Profile)
exports.getUserReviews = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Please login' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const reviews = await Review.find({ user: decoded.id })
      .populate('restaurant', 'name') // ดึงชื่อร้านอาหารมาแสดงด้วย
      .sort('-createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};