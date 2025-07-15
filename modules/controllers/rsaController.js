// File: controllers/rsaController.js
const prisma = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { encryptPrivateKey, decryptPrivateKey } = require('../utils/cryptoHelpers');
const log = require('../utils/logger');

// Hàm helper để mã hóa private key
// const encryptPrivateKey = (privateKey, passphrase) => {
//     const salt = crypto.randomBytes(16); // Tạo salt ngẫu nhiên
//     // Dùng PBKDF2 để tạo key 256-bit (32-byte) an toàn từ passphrase
//     const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
//     const iv = crypto.randomBytes(16); // Tạo IV ngẫu nhiên

//     const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
//     let encrypted = cipher.update(privateKey, 'utf8', 'hex');
//     encrypted += cipher.final('hex');

//     return {
//         encryptedData: encrypted,
//         salt: salt.toString('hex'),
//         iv: iv.toString('hex')
//     };
// };

// Controller để tạo khóa
exports.generateKeys = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Kiểm tra user đã có khóa RSA chưa
        const existingKey = await prisma.rSAKey.findUnique({
            where: { userId: userId }
        });

        if (existingKey) {
            return res.status(409).json({ message: 'User already has an RSA key. Delete the old one to generate a new key.' });
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required to generate keys.' });
        }

        // Lấy thông tin user (bao gồm cả passwordHash) từ DB
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Xác thực lại mật khẩu người dùng nhập
        const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password. Key generation denied." });
        }

        // Tạo cặp khóa RSA 2048-bit
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        // Mã hóa Private Key bằng AES
        const { encryptedData, salt, iv } = encryptPrivateKey(privateKey, password);

        // Đặt hạn dùng 90 ngày
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        // Lưu vào database
        const newKey = await prisma.rSAKey.create({
            data: {
                publicKey: publicKey,
                encryptedPrivateKey: encryptedData,
                passphraseSalt: salt,
                iv: iv,
                expiresAt: expiresAt,
                userId: userId
            }
        });

        res.status(201).json({
            message: 'RSA key pair generated and saved successfully.',
            publicKey: newKey.publicKey,
            createdAt: newKey.createdAt,
            expiresAt: newKey.expiresAt,
        });
        log(user.email, 'Generate RSA Keys', 'Success', 'RSA key pair generated and saved');

    } catch (error) {
        console.error("Error generating RSA keys:", error);
        log(req.user.email, 'Generate RSA Keys', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller để lấy trạng thái khóa
exports.getKeyStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Tìm khóa duy nhất của user
        const key = await prisma.rSAKey.findUnique({
            where: { userId: userId }
        });
        
        if (!key) {
            return res.status(200).json({ hasKey: false });
        }

        // Tính toán trạng thái hết hạn
        const now = new Date();
        const expiresInDays = Math.floor((key.expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        let expiryStatus = 'active';
        if (expiresInDays <= 0) {
            expiryStatus = 'expired';
        } else if (expiresInDays <= 15) { // Cảnh báo trước 15 ngày
            expiryStatus = 'expiring_soon';
        }
        
        res.status(200).json({
            hasKey: true,
            publicKey: key.publicKey,
            createdAt: key.createdAt,
            expiresAt: key.expiresAt,
            expiryStatus: expiryStatus, // Trạng thái: active, expiring_soon, expired
            expiresInDays: expiresInDays > 0 ? expiresInDays : 0
        });
        log(req.user.email, 'Get Key Status', 'Success', 'Key status retrieved');

    } catch (error) {
        console.error("Lỗi khi lấy trạng thái khóa:", error);
        log(req.user.email, 'Get Key Status', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Xóa khóa
exports.deleteKey = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        await prisma.rSAKey.delete({
            where: { userId: userId }
        });

        res.status(200).json({ message: 'RSA key deleted successfully.' });
        log(req.user.email, 'Delete Key', 'Success', 'RSA key deleted successfully');

    } catch (error) {
        console.error("Lỗi khi xóa khóa:", error);
        log(req.user.email, 'Delete Key', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.verifyPrivateKeyAccess = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required." });
        }

        const userKey = await prisma.rSAKey.findUnique({
            where: { userId }
        });

        if (!userKey) {
            return res.status(404).json({ message: "No RSA key found." });
        }

        // Thử giải mã Private Key bằng mật khẩu được cung cấp
        // Hàm decryptPrivateKey sẽ ném lỗi nếu giải mã thất bại
        const decryptedKey = decryptPrivateKey(
            userKey.encryptedPrivateKey,
            password,
            userKey.passphraseSalt,
            userKey.iv
        );

        // Nếu không có lỗi, có nghĩa là giải mã thành công
        res.status(200).json({ 
            message: "Verification successful! The provided password can decrypt the private key.",
            // Chỉ trả về một phần nhỏ của private key để xác nhận, không bao giờ trả về toàn bộ
            privateKeySnippet: decryptedKey.substring(0, 50) + "..."
        });
        log(req.user.email, 'Verify Private Key Access', 'Success', 'Private key access verified');

    } catch (error) {
        // Lỗi từ decryptPrivateKey sẽ được bắt ở đây
        console.error("Verification failed:", error.message);
        log(req.user.email, 'Verify Private Key Access', 'Failed', error.message);
        res.status(401).json({ message: "Verification failed. Incorrect password." });
    }
};

exports.renewKey = async (req, res) => {
    try {
        const userId = req.user.userId;

        const userKey = await prisma.rSAKey.findUnique({
            where: { userId: userId }
        });

        if (!userKey) {
            return res.status(404).json({ message: "No RSA key found to renew." });
        }

        const now = new Date();
        const newExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // Gia hạn thêm 90 ngày

        const updatedKey = await prisma.rSAKey.update({
            where: { userId: userId },
            data: { expiresAt: newExpiresAt }
        });

        res.status(200).json({
            message: "RSA key renewed successfully.",
            expiresAt: updatedKey.expiresAt
        });
        log(req.user.email, 'Renew RSA Key', 'Success', 'RSA key renewed successfully');

    } catch (error) {
        console.error("Error renewing RSA key:", error);
        log(req.user.email, 'Renew RSA Key', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};