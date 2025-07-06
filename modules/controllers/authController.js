const prisma = require("../config/db"); // Import Prisma client từ file config
const bcrypt = require("bcryptjs"); // Cần cài đặt: npm install bcryptjs
const jwt = require("jsonwebtoken"); // Cần cài đặt: npm install jsonwebtoken
const nodemailer = require("nodemailer");

// Hàm xử lý đăng ký
const signup = async (req, res) => {
  console.log("--- [Start] /signup request ---");
  try {
    console.log("[Received data]:", req.body);
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth, // YYYY-MM-DD string from frontend
      countryCode, // New from frontend
      phoneNumber, // New from frontend
      address,
      terms, // New from frontend
    } = req.body;

    // Combine countryCode and phoneNumber into a single phone string with desired format
    const fullPhoneNumber = phoneNumber
      ? `(${countryCode})${phoneNumber}`
      : null;

    // Safely parse dateOfBirth string to Date object
    let parsedBirthDate = null;
    console.log("[Debug] dateOfBirth string received:", dateOfBirth); // DEBUG LOG 1
    if (dateOfBirth) {
      const dateObj = new Date(dateOfBirth);
      console.log("[Debug] new Date(dateOfBirth) result:", dateObj); // DEBUG LOG 2
      // Check if the dateObj is a valid date
      if (!isNaN(dateObj.getTime())) {
        parsedBirthDate = dateObj;
        console.log("[Debug] parsedBirthDate (valid):", parsedBirthDate); // DEBUG LOG 3
      } else {
        console.log(
          "[Debug] dateObj is invalid. Setting parsedBirthDate to null."
        ); // DEBUG LOG 4
      }
    } else {
      console.log(
        "[Debug] dateOfBirth string is empty or null. Setting parsedBirthDate to null."
      ); // DEBUG LOG 5
    }

    console.log("[Preparing] Writing to database...");
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
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
        birthDate: parsedBirthDate, // Use the safely parsed Date object
        phone: fullPhoneNumber, // Use the combined phone number
        address,
        passwordHash,
        passwordSalt: salt,
        // role: 'USER', // Default role is handled by Prisma schema now
      },
    });

    // Xóa mật khẩu trước khi gửi về cho client
    const userResponse = { ...newUser };
    delete userResponse.passwordHash;
    delete userResponse.passwordSalt;

    console.log("✅ [Success] User created with id:", newUser.id);
    res
      .status(201)
      .json({ message: "Sign Up successfully!", user: userResponse });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
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
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2. So khớp mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
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

    res.status(200).json({ message: "OTP has been sent to your email." });
  } catch (error) {
    console.error("Error in signin step 1:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid request." });
    }

    // 2. Kiểm tra OTP
    const now = new Date();

    // === XỬ LÝ KHI OTP HẾT HẠN ===
    // Chỉ thông báo, không tạo mã mới
    if (user.otpExpiresAt < now) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // === XỬ LÝ KHI OTP SAI ===
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // === XỬ LÝ KHI OTP ĐÚNG ===
    // Xóa OTP sau khi xác thực thành công
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpCreatedAt: null, otpExpiresAt: null },
    });

    // 4. Tạo JSON Web Token (JWT) để duy trì phiên đăng nhập
    // const token = jwt.sign(
    //   { userId: user.id, email: user.email },
    //   process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY', // Nên đặt secret key trong file .env
    //   { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    // );

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, firstName: user.firstName },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CryptoAuthSystem" <${process.env.MAIL_SENDER}>`,
      to: email,
      subject: "Login Verification Code (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h1 style="font-size: 24px; color: #0C5776;">CryptoAuthSystem</h1>
          </div>
          <div style="padding: 30px 0; text-align: center;">
            <p style="font-size: 18px; margin-bottom: 20px;">Your One-Time Password (OTP) is:</p>
            <div style="display: inline-block; background-color: #e0f7fa; color: #333; font-size: 32px; font-weight: 900; padding: 15px 25px; border-radius: 8px; letter-spacing: 3px; border: 1px solid #b2ebf2;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #777; margin-top: 20px;">This code will expire in 5 minutes.</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
            <p>If you did not request this, please ignore this email.</p>
            <p>&copy; 2025 CryptoAuthSystem. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`New OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    return false;
  }
};

module.exports = {
  signup,
  signin,
  signinStep1,
  verifyOtp,
};
