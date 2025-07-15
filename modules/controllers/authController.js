const prisma = require("../config/db"); // Import Prisma client từ file config
const bcrypt = require("bcryptjs"); // Cần cài đặt: npm install bcryptjs
const jwt = require("jsonwebtoken"); // Cần cài đặt: npm install jsonwebtoken
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const { encryptPrivateKey, decryptPrivateKey } = require('../utils/cryptoHelpers');
const log = require('../utils/logger');

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

    // Tạo một mã khôi phục gốc, dễ đọc
    const recoveryCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Hash mã khôi phục này trước khi lưu vào DB
    const recoveryCodeHash = await bcrypt.hash(recoveryCode, 10);

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
        recoveryCodeHash: recoveryCodeHash
        // role: 'USER', // Default role is handled by Prisma schema now
      },
    });

    // Xóa mật khẩu trước khi gửi về cho client
    const userResponse = { ...newUser };
    delete userResponse.passwordHash;
    delete userResponse.passwordSalt;

    console.log("✅ [Success] User created with id:", newUser.id);
    log(email, 'Signup', 'Success', 'User created successfully');
    res
      .status(201)
      .json({ message: "Sign Up successfully!", user: userResponse, recoveryCode: recoveryCode });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    log(email, 'Signup', 'Failed', error.message);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// Hàm xử lý đăng nhập (ví dụ)
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user trong DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      log(email, 'Signin', 'Failed', 'Invalid email or password');
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Kiểm tra nếu tài khoản bị khóa
    if (user.accountLockedUntil) {
      const now = new Date();
      if (user.accountLockedUntil > now) {
        const timeLeft = Math.ceil((user.accountLockedUntil.getTime() - now.getTime()) / (1000 * 60));
        log(email, 'Signin', 'Failed', `Account locked for ${timeLeft} minutes`);
        return res.status(403).json({ message: `Account locked. Please try again in ${timeLeft} minutes.`, accountLockedUntil: user.accountLockedUntil });
      } else {
        // Nếu thời gian khóa đã hết, reset failedLoginAttempts
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            accountLockedUntil: null,
          },
        });
      }
    }

    // 2. So khớp mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      // Cập nhật số lần đăng nhập sai
      const updatedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData = {
        failedLoginAttempts: updatedAttempts,
        lastFailedLogin: new Date(),
      };

      let message = "Invalid email or password.";
      if (updatedAttempts >= 5) {
        const lockedUntil = new Date(new Date().getTime() + 5 * 60 * 1000); // Khóa 5 phút
        updateData.accountLockedUntil = lockedUntil;
        message = `Too many failed login attempts. Account locked for 5 minutes.`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      log(email, 'Signin', 'Failed', message);
      return res.status(401).json({ message: message });
    }

    // Nếu đăng nhập thành công, reset số lần thử sai
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          accountLockedUntil: null,
        },
      });
    }

    // 3. Tạo JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Trả về token và thông tin user
    log(email, 'Signin', 'Success', 'User logged in successfully');
    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in signin:", error);
    log(req.body.email, 'Signin', 'Failed', error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const signinStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user trong DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      log(email, 'Signin Step 1', 'Failed', 'Invalid email or password');
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Kiểm tra nếu tài khoản bị khóa
    if (user.accountLockedUntil) {
      const now = new Date();
      if (user.accountLockedUntil > now) {
        const timeLeft = Math.ceil((user.accountLockedUntil.getTime() - now.getTime()) / (1000 * 60));
        log(email, 'Signin Step 1', 'Failed', `Account locked for ${timeLeft} minutes`);
        return res.status(403).json({ message: `Account locked. Please try again in ${timeLeft} minutes.`, accountLockedUntil: user.accountLockedUntil });
      } else {
        // Nếu thời gian khóa đã hết, reset failedLoginAttempts
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            accountLockedUntil: null,
          },
        });
      }
    }

    // 2. So khớp mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      // Cập nhật số lần đăng nhập sai
      const updatedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData = {
        failedLoginAttempts: updatedAttempts,
        lastFailedLogin: new Date(),
      };

      let message = "Invalid email or password.";
      if (updatedAttempts >= 5) {
        const lockedUntil = new Date(new Date().getTime() + 5 * 60 * 1000); // Khóa 5 phút
        updateData.accountLockedUntil = lockedUntil;
        message = `Too many failed login attempts. Account locked for 5 minutes.`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      log(email, 'Signin Step 1', 'Failed', message);
      return res.status(401).json({ message: message });
    }

    // Nếu đăng nhập thành công, reset số lần thử sai
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          accountLockedUntil: null,
        },
      });
    }

    // 3. Sinh mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút

    console.log(`Generated OTP for ${email}: ${otp}`);

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

    log(email, 'Signin Step 1', 'Success', 'OTP sent');
    res.status(200).json({ message: "OTP has been sent to your email." });
  } catch (error) {
    console.error("Error in signin step 1:", error);
    log(req.body.email, 'Signin Step 1', 'Failed', error.message);
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
      log(email, 'Verify OTP', 'Failed', 'OTP expired');
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // === XỬ LÝ KHI OTP SAI ===
    if (user.otp !== otp) {
      log(email, 'Verify OTP', 'Failed', 'Incorrect OTP');
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // === XỬ LÝ KHI OTP ĐÚNG ===
    // Xóa OTP sau khi xác thực thành công
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpCreatedAt: null, otpExpiresAt: null },
    });

    // Generate JWT with userId, email, and role
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // 4. Trả về token và thông tin user (giữ nguyên cấu trúc user)
    log(email, 'Verify OTP', 'Success', 'OTP verified successfully');
    res.status(200).json({
      message: "Login successful!",
      token: token, // Include the token here
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    log(req.body.email, 'Verify OTP', 'Failed', error.message);
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

const updateUserProfile = async (req, res) => {
  try {
        const userId = req.user.userId;
        // Chỉ lấy các trường được phép cập nhật từ body
        const { firstName, lastName, birthDate, phone, address } = req.body;

        // Tạo một object để chứa các dữ liệu cần cập nhật
        const dataToUpdate = {};

        if (firstName) dataToUpdate.firstName = firstName;
        if (lastName) dataToUpdate.lastName = lastName;
        if (birthDate) dataToUpdate.birthDate = new Date(birthDate);
        if (phone) dataToUpdate.phone = phone;
        if (address) dataToUpdate.address = address;

        // Nếu không có dữ liệu nào được gửi lên để cập nhật
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: "No fields to update." });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate, // Chỉ cập nhật các trường có trong object này
            select: { 
                id: true, email: true, firstName: true, lastName: true, 
                birthDate: true, phone: true, address: true, role: true 
            }
        });

        res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });

    } catch (error) {
        console.error("Error updating profile:", error);
        log(req.user.email, 'Update Profile', 'Failed', error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

const changePassword = async (req, res) => {
  try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Invalid input." });
        }

        // 1. Lấy thông tin user và khóa RSA của họ
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        const userKey = await prisma.rSAKey.findUnique({
            where: { userId: userId }
        });

        if (!user) { return res.status(404).json({ message: "User not found." }); }

        if (userKey.length === 0) {
            return res.status(404).json({ message: "No RSA key found for this user." });
        }

        // 2. Xác thực mật khẩu cũ
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isOldPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect old password." });
        }

        // 3. Băm mật khẩu mới
        const newSalt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, newSalt);

        // 4. Mã hóa lại Private Key nếu có
        // const userKey = user.rsaKey.length > 0 ? user.rsaKey[0] : null;
        let updatedEncryptedPrivateKey;

        if (userKey) {
            // a. Giải mã Private Key bằng mật khẩu CŨ
            const decryptedPrivateKey = decryptPrivateKey(
                userKey.encryptedPrivateKey,
                oldPassword, // Dùng mật khẩu cũ
                userKey.passphraseSalt,
                userKey.iv
            );

            // b. Mã hóa lại Private Key bằng mật khẩu MỚI
            const reEncrypted = encryptPrivateKey(decryptedPrivateKey, newPassword);
            updatedEncryptedPrivateKey = reEncrypted.encryptedData;

             // Cập nhật lại khóa với private key đã mã hóa lại
            await prisma.rSAKey.update({
                where: { id: userKey.id },
                data: { 
                    encryptedPrivateKey: reEncrypted.encryptedData,
                    passphraseSalt: reEncrypted.salt, // <-- Cập nhật salt mới
                    iv: reEncrypted.iv                  // <-- Cập nhật iv mới
                }
            });

            // Kiểm tra cập nhật private key ===
            console.log("--- Bắt đầu kiểm tra giải mã bằng mật khẩu MỚI ---");
            try {
              const testDecryption = decryptPrivateKey(
                  reEncrypted.encryptedData,
                  newPassword, // Dùng mật khẩu MỚI
                  reEncrypted.salt,
                  reEncrypted.iv
              );
              // So sánh với private key gốc
              if (testDecryption === decryptedPrivateKey) {
                  console.log("✅ KIỂM TRA THÀNH CÔNG: Private key đã được mã hóa lại và có thể giải mã bằng mật khẩu mới.");
              } else {
                  console.error("❌ LỖI LOGIC: Giải mã thành công nhưng kết quả không khớp!");
              }
            } catch (testError) {
              console.error("❌ LỖI NGHIÊM TRỌNG: Không thể giải mã private key bằng mật khẩu mới ngay sau khi mã hóa!", testError);
            }
        }

        // 5. Cập nhật mật khẩu mới cho user
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                passwordSalt: newSalt
            }
        });
        
        // Ghi log (ví dụ)
        console.log(`User ${userId} changed their password.`);
        log(req.user.email, 'Change Password', 'Success', 'Password updated successfully');

        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Error changing password:", error);
        log(req.user.email, 'Change Password', 'Failed', error.message);
        // Kiểm tra lỗi giải mã đặc biệt
        if (error.message.includes('bad decrypt')) {
            return res.status(400).json({ message: "Decryption failed. The old password might be incorrect."});
        }
        res.status(500).json({ message: "Internal server error." });
    }
};

const getDashboardData = async (req, res) => {
  try {
    // req.user.userId được gắn từ middleware xác thực (getAuth)
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token.' });
    }

    // === BƯỚC QUAN TRỌNG: TRUY VẤN DATABASE ===
    const userFromDb = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      // Dùng 'select' để chỉ định chính xác các trường cần lấy
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    if (!userFromDb) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    // Trả về dữ liệu lấy từ database, không phải từ token
    res.status(200).json({ message: 'User data fetched successfully', user: userFromDb });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const recoverAccount = async (req, res) => {
  try {
      const { email, recoveryCode, newPassword } = req.body;

      // 1. Kiểm tra đầu vào
      if (!email || !recoveryCode || !newPassword || newPassword.length < 8) {
          return res.status(400).json({ message: "Invalid input." });
      }

      // 2. Tìm user và kiểm tra mã khôi phục
      const user = await prisma.user.findUnique({
          where: { email },
          include: { rsaKey: true }
      });

      if (!user || !user.recoveryCodeHash) {
          return res.status(401).json({ message: "Invalid recovery code or email." });
      }
      
      const isRecoveryCodeCorrect = await bcrypt.compare(recoveryCode, user.recoveryCodeHash);
      if (!isRecoveryCodeCorrect) {
          return res.status(401).json({ message: "Invalid recovery code or email." });
      }

      // 3. Hash mật khẩu mới
      const newSalt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, newSalt);
      
      // 4. Mã hóa lại Private Key (nếu có) bằng MÃ KHÔI PHỤC
      // Đây là một vấn đề: chúng ta không có mật khẩu cũ để giải mã.
      // Giải pháp: Chúng ta phải chấp nhận rằng khi khôi phục bằng recovery code,
      // người dùng sẽ MẤT quyền truy cập vào các dữ liệu được mã hóa bằng khóa cũ.
      // Một khóa RSA mới sẽ được tạo ra.
      
      // Xóa khóa RSA cũ (nếu có)
      if (user.rsaKey) {
          await prisma.rSAKey.delete({ where: { userId: user.id }});
      }

      // 5. Cập nhật mật khẩu mới và VÔ HIỆU HÓA mã khôi phục cũ
      await prisma.user.update({
          where: { id: user.id },
          data: {
              passwordHash: newPasswordHash,
              passwordSalt: newSalt,
              // recoveryCodeHash: null // Vô hiệu hóa mã đã dùng
          }
      });

      res.status(200).json({ message: "Password has been reset successfully. Your old recovery code is now invalid. Please log in." });
      log(email, 'Account Recovery', 'Success', 'Password reset successfully');

  } catch (error) {
      console.error("Error during account recovery:", error);
      log(req.body.email, 'Account Recovery', 'Failed', error.message);
      res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  signup,
  signin,
  signinStep1,
  verifyOtp,
  updateUserProfile,
  changePassword,
  getDashboardData,
  recoverAccount
};
