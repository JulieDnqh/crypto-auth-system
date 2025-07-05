const prisma = require('../config/db'); // Import Prisma client từ file config
const bcrypt = require('bcryptjs');     // Cần cài đặt: npm install bcryptjs
const jwt = require('jsonwebtoken');  // Cần cài đặt: npm install jsonwebtoken

// Hàm xử lý đăng ký
const signup = async (req, res) => {
  console.log('--- [Bắt đầu] Yêu cầu /signup ---');
  try {
    console.log('[Dữ liệu nhận được]:', req.body);
    const {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phone,
      address
    } = req.body;

    console.log('[Chuẩn bị] Ghi vào database...');
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null, // Chuyển chuỗi ngày thành object Date
        phone,
        address,
        passwordHash,
        passwordSalt: salt,
      },
    });

    // Xóa mật khẩu trước khi gửi về cho client
    const userResponse = { ...newUser };
    delete userResponse.passwordHash;
    delete userResponse.passwordSalt;

    console.log('✅ [Thành công] Đã tạo user:', newUser.id);
    res.status(201).json({ message: 'Đăng ký thành công!', user: userResponse });

  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
};

// Hàm xử lý đăng nhập (ví dụ)
const signin = async (req, res) => {
    // ... Logic đăng nhập sẽ được thêm vào đây ...
};


module.exports = {
  signup,
  signin,
};