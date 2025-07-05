const prisma = require('../config/db'); // Import Prisma client từ file config
const bcrypt = require('bcryptjs');     // Cần cài đặt: npm install bcryptjs
const jwt = require('jsonwebtoken');  // Cần cài đặt: npm install jsonwebtoken
const nodemailer = require('nodemailer');

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

    console.log('✅ [Thành công] Đã tạo user với id:', newUser.id);
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

const signinStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user trong DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // 2. So khớp mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // 3. Sinh mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút

    // 4. Lưu OTP và thời gian vào database
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpCreatedAt: now,
        otpExpiresAt,
      },
    });

    // Gọi hàm gửi email
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: 'Mã OTP đã được gửi đến email của bạn.' });

  } catch (error) {
    console.error("Lỗi ở bước 1 đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    
    // 2. Kiểm tra OTP
    const now = new Date();

    // === XỬ LÝ KHI OTP HẾT HẠN ===
    // Chỉ thông báo, không tạo mã mới
    if (user.otpExpiresAt < now) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    // === XỬ LÝ KHI OTP SAI ===
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác.' });
    }

    // === XỬ LÝ KHI OTP ĐÚNG ===
    // Xóa OTP sau khi xác thực thành công
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpCreatedAt: null, otpExpiresAt: null }
    });

    // 4. Tạo JSON Web Token (JWT) để duy trì phiên đăng nhập
    // const token = jwt.sign(
    //   { userId: user.id, email: user.email },
    //   process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY', // Nên đặt secret key trong file .env
    //   { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    // );
    
    res.status(200).json({ message: 'Đăng nhập thành công!', user: {id: user.id, email: user.email, firstName: user.firstName } });

  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CryptoAuthSystem" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Mã xác thực đăng nhập (OTP)",
      html: `<p>Mã OTP của bạn là: <b>${otp}</b>. Mã này sẽ hết hạn trong 5 phút.</p>`,
    });

    console.log(`Đã gửi OTP mới đến ${email}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi gửi email đến ${email}:`, error);
    return false;
  }
};

module.exports = {
  signup,
  signin,
  signinStep1,
  verifyOtp,
};