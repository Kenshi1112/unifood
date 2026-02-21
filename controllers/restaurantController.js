const Restaurant = require('../models/restaurant');
const Menu = require('../models/Menu');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// @desc    Create new restaurant and add menus if provided
// @route   POST /api/restaurant
// @access  Private
exports.createRestaurant = async (req, res, next) => {
  try {
    // แยกข้อมูล menus ออกจากข้อมูลร้านอาหาร (ถ้ามี)
    const { menus, ...restaurantData } = req.body;

    // ถ้ามีการ Login และมี req.user ให้ใส่ user id เป็นเจ้าของร้าน
    // (สมมติว่ามี Middleware auth ที่ใส่ req.user มาให้)
    if (req.user) {
      restaurantData.user = req.user.id;
    }

    //backend รับรูปภาพ
    if (req.file) {
      restaurantData.images = [req.file.path];
    }

    // 1. สร้างร้านอาหาร
    const restaurant = await Restaurant.create(restaurantData);

    // 2. ถ้ามีข้อมูล menus ส่งมาด้วย ให้ทำการบันทึกเมนู
    if (menus && Array.isArray(menus) && menus.length > 0) {
      // วนลูปเพิ่ม restaurant id ให้กับทุกเมนู
      const menuItems = menus.map(menu => ({
        ...menu,
        restaurant: restaurant._id
      }));

      // บันทึกเมนูทั้งหมดทีเดียว (Bulk Insert)
      await Menu.insertMany(menuItems);
    }

    res.status(201).json({
      success: true,
      data: restaurant,
      menuCount: menus ? menus.length : 0
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all restaurants (with filters and optionally only favorites)
// @route   GET /api/restaurant
// @access  Public (but favorites filter requires auth)
exports.getRestaurants = async (req, res, next) => {
  try {
    let query = {}; // สร้าง Object สำหรับเก็บเงื่อนไขการค้นหา

    // 1. รับค่าจาก Frontend (ที่ส่งมาจาก params ใน index.html)
    const { keyword, category, university, favorites } = req.query;

    // 2. สร้างเงื่อนไขการค้นหา
    if (keyword) {
      // ค้นหาจากชื่อร้าน โดยใช้ Regex (ไม่สนใจตัวพิมพ์เล็ก/ใหญ่)
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (category) {
      // ค้นหาตามหมวดหมู่
      query.category = category;
    }

    if (university) {
      // ค้นหาตามมหาวิทยาลัย
      query.university = university;
    }

    let restaurants;

    // 3. ตรวจสอบว่าเป็นการขอดูเฉพาะร้านโปรด (Favorites) หรือไม่
    if (favorites === 'true') {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id);
      
      if (!user || user.role !== 'user') {
        return res.status(403).json({ success: false, error: 'Only users can view favorites' });
      }

      // เพิ่มเงื่อนไขเข้าไปว่า ต้องเป็นร้านที่อยู่ใน Array favorites ของ user เท่านั้น
      query._id = { $in: user.favorites };
    }

    // 4. ดึงข้อมูลตามเงื่อนไข (Query) ที่สร้างไว้
    restaurants = await Restaurant.find(query).populate('menus');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ==========================================
// ส่วนที่หายไป: ฟังก์ชันสำหรับดึงข้อมูลร้านเดียว
// ==========================================
// @desc    Get single restaurant
// @route   GET /api/restaurant/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('menus').populate('reviews');

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// ==========================================

// คุณสามารถเพิ่มฟังก์ชัน updateRestaurant และ deleteRestaurant เพิ่มเติมได้ที่นี่
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // ตรวจสอบว่ามี req.user หรือไม่
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // ตรวจสอบว่าเป็นเจ้าของร้าน หรือ Admin หรือไม่
    // ใช้ ?.toString() หรือตรวจสอบค่า null เพื่อป้องกัน Error กรณีร้านไม่มีเจ้าของ
    const ownerId = restaurant.user ? restaurant.user.toString() : null;
    
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this restaurant' });
    }

    // เพิ่มการอัปเดตรูปภาพ ถ้ามีไฟล์ใหม่
    if (req.file) {
      req.body.images = [req.file.path];
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // ตรวจสอบว่ามี req.user หรือไม่
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // ตรวจสอบว่าเป็นเจ้าของร้าน หรือ Admin หรือไม่
    const ownerId = restaurant.user ? restaurant.user.toString() : null;

    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this restaurant' });
    }

    // ใช้ .deleteOne() เพื่อให้ไป trigger middleware ใน model สำหรับลบ reviews และ menus
    await restaurant.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err); // แสดง Error ใน Console ฝั่ง Server เพื่อช่วย Debug
    res.status(400).json({ success: false, error: err.message });
  }
};