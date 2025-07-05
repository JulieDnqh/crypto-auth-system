const { PrismaClient } = require('@prisma/client');

// Khởi tạo một instance duy nhất của Prisma Client
const prisma = new PrismaClient({
  // Tùy chọn để log các câu lệnh query ra console, hữu ích khi debug
  log: ['query', 'info', 'warn', 'error'],
});

console.log('Prisma Client Initialized');

module.exports = prisma;