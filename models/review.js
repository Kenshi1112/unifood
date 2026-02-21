const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: { type: String, required: [true, 'Please add some text'] },
  createdAt: { type: Date, default: Date.now },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per restaurant
ReviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(restaurantId) {
  const obj = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: '$restaurant', averageRating: { $avg: '$rating' } } }
  ]);

  try {
    await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
      averageRating: obj[0] ? obj[0].averageRating : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.restaurant);
});

module.exports = mongoose.model('Review', ReviewSchema);