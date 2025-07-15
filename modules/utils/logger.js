
const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', '..', 'security.log');

const log = async (email, action, status, details = '') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${email}] [${action}] [${status}] ${details}\n`;

    // Ghi vào file security.log
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });

    // Ghi vào database
    try {
        await prisma.logActivity.create({
            data: {
                email,
                action,
                status,
                details,
            },
        });
    } catch (error) {
        console.error('Failed to write log to database:', error);
    }
};

module.exports = log;