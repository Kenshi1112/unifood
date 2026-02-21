const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  googleMapLink: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please use a valid URL with HTTP or HTTPS']
  },
  images: {
    type: [String], // Array of image URLs
    default: []
  },
  category: {
    type: String,
    required: true,
    enum: ['Street Food', 'Cafe', 'Buffet', 'Fast Food', 'Other']
  },
  university: {
  type: String,
  required: true,
  enum: ['KUKPS', 'CU', 'TU', 'KMUTT', 'MU', 'Other']
},
  averageRating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true } // Owner
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// When a restaurant is deleted, also delete associated reviews and menus.
RestaurantSchema.pre('deleteOne', { document: true, query: false }, async function() {
  console.log(`Deleting associated reviews for restaurant ${this._id}`);
  await this.model('Review').deleteMany({ restaurant: this._id });

  console.log(`Deleting associated menus for restaurant ${this._id}`);
  await this.model('Menu').deleteMany({ restaurant: this._id });
});

// Reverse populate with virtuals to show related data.
RestaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false
});

RestaurantSchema.virtual('menus', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
