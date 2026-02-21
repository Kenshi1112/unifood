const Issue = require('../models/issue');
const User = require('../models/user'); // 👈 เพิ่มบรรทัดนี้เข้ามา เพื่อให้รู้จัก User Model

// @desc    รับแจ้งปัญหา
// @route   POST /api/issue
// @access  Private (user, storekeeper)
exports.createIssue = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'กรุณากรอกข้อความ' });
    if (!req.user) return res.status(401).json({ success: false, error: 'กรุณาเข้าสู่ระบบ' });

    const issueData = {
      user: req.user.id,
      role: req.user.role,
      message
    };
    if (req.file) {
      issueData.image = req.file.path;
    }
    const issue = await Issue.create(issueData);
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    ดูรายการแจ้งปัญหา (admin)
// @route   GET /api/issue
// @access  Private (admin)
exports.getIssues = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admin can view issues' });
    }

    // 👈 แก้คำสั่ง populate ใหม่ โดยยัด User model เข้าไปตรงๆ ป้องกัน Error หาไม่เจอ
    const issues = await Issue.find().populate({
        path: 'user',
        select: 'name username email', // ดึงข้อมูลมาเผื่อไว้เลย หน้าเว็บจะได้มีโชว์แน่นอน
        model: User
    });
    
    res.status(200).json({ success: true, data: issues });

  } catch (err) {
    console.error("❌ Error in getIssues:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};