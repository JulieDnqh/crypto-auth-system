const prisma = require('../config/db');
const log = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                failedLoginAttempts: true,
                accountLockedUntil: true,
                createdAt: true,
            },
        });
        log(req.user.email, 'Admin - Get All Users', 'Success', 'Fetched all users');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting all users:", error);
        log(req.user.email, 'Admin - Get All Users', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Lock user account
exports.lockUserAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { lockDurationMinutes } = req.body; // Duration in minutes

        if (!lockDurationMinutes || typeof lockDurationMinutes !== 'number' || lockDurationMinutes <= 0) {
            return res.status(400).json({ message: 'Invalid lock duration.' });
        }

        const lockedUntil = new Date(new Date().getTime() + lockDurationMinutes * 60 * 1000);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                accountLockedUntil: lockedUntil,
                failedLoginAttempts: 0, // Reset attempts on manual lock
            },
            select: { id: true, email: true, accountLockedUntil: true },
        });
        log(req.user.email, 'Admin - Lock User Account', 'Success', `Locked user ${updatedUser.email} until ${updatedUser.accountLockedUntil}`);
        res.status(200).json({ message: `User ${updatedUser.email} locked successfully until ${updatedUser.accountLockedUntil}.` });
    } catch (error) {
        console.error("Error locking user account:", error);
        log(req.user.email, 'Admin - Lock User Account', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Unlock user account
exports.unlockUserAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                accountLockedUntil: null,
                failedLoginAttempts: 0,
            },
            select: { id: true, email: true, accountLockedUntil: true },
        });
        log(req.user.email, 'Admin - Unlock User Account', 'Success', `Unlocked user ${updatedUser.email}`);
        res.status(200).json({ message: `User ${updatedUser.email} unlocked successfully.` });
    } catch (error) {
        console.error("Error unlocking user account:", error);
        log(req.user.email, 'Admin - Unlock User Account', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all log activities
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await prisma.logActivity.findMany({
            orderBy: {
                timestamp: 'desc',
            },
        });
        log(req.user.email, 'Admin - Get All Logs', 'Success', 'Fetched all logs');
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error getting all logs:", error);
        log(req.user.email, 'Admin - Get All Logs', 'Failed', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};