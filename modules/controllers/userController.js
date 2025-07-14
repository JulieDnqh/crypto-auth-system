const prisma = require('../config/db');
const log = require('../utils/logger');

exports.findUserPublicKey = async (req, res) => {
    try {
        const { email } = req.query; // Lấy email từ query param, vd: /api/users/key?email=...

        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        // Tìm user và khóa RSA tương ứng
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(200).json({
                found: false,
                message: `User with email '${email}' is not registered.`
            });
        }

        let userId = user ? user.id : null;

        const userKey = await prisma.rSAKey.findUnique({
            where: { userId: userId }
        });

        if (!userKey) {
            // Trả về status 200 với thông tin khóa là null
            return res.status(200).json({
                found: true,
                email: user.email,
                firstName: user.firstName,
                publicKey: null,
                createdAt: null,
                expiresAt: null,
                expiresInDays: null,
            });
        }

        // Tính toán ngày hết hạn
        const now = new Date();
        const expiresInDays = Math.floor((userKey.expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));

        res.status(200).json({
            found: true,
            email: user.email,
            firstName: user.firstName,
            publicKey: userKey.publicKey,
            createdAt: userKey.createdAt,
            expiresAt: userKey.expiresAt,
            expiresInDays: expiresInDays > 0 ? expiresInDays : 0,
        });
        log(email, 'Find User Public Key', 'Success', 'Public key found');

    } catch (error) {
        console.error("Error finding user public key:", error);
        log(req.query.email, 'Find User Public Key', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};