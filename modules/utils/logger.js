
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', '..', 'security.log');

const log = (email, action, status, details = '') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${email}] [${action}] [${status}] ${details}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

module.exports = log;

