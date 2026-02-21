const Menu = require('../models/Menu');
const Restaurant = require('../models/restaurant');

// @desc    Add menu to restaurant
// @route   POST /api/restaurant/:restaurantId/menu
// @access  Private (Owner/Admin)
exports.addMenu = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;

    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // ตรวจสอบว่าเป็นเจ้าของร้าน หรือ Admin หรือไม่
    if (restaurant.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add menu to this restaurant' });
    }

    // จัดการรูปภาพถ้ามีการอัปโหลด
    if (req.file) {
      req.body.image = req.file.path;
    }

    const menu = await Menu.create(req.body);

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get menus for a restaurant
// @route   GET /api/restaurant/:restaurantId/menu
// @access  Public
exports.getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ restaurant: req.params.restaurantId });

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete menu
// @route   DELETE /api/restaurant/:restaurantId/menu/:id
// @access  Private (Owner/Admin)
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ success: false, error: 'Menu not found' });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);

    // ตรวจสอบว่าเป็นเจ้าของร้าน หรือ Admin หรือไม่
    if (restaurant.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this menu' });
    }

    await menu.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};