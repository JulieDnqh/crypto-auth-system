const crypto = require('crypto');

// Thuật toán và kích thước key
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for AES
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha512';

/**
 * Mã hóa một chuỗi (ví dụ: private key) bằng thuật toán AES-256-CBC.
 * Sử dụng PBKDF2 để tạo key an toàn từ một passphrase.
 * 
 * @param {string} textToEncrypt - Chuỗi cần mã hóa.
 * @param {string} passphrase - Cụm mật khẩu để tạo key.
 * @returns {{encryptedData: string, salt: string, iv: string}} - Dữ liệu đã mã hóa và các tham số cần thiết để giải mã.
 */
const encryptPrivateKey = (textToEncrypt, passphrase) => {
  // 1. Tạo một salt ngẫu nhiên cho mỗi lần mã hóa
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 2. Dùng PBKDF2 để tạo ra một key mã hóa mạnh từ passphrase và salt
  const key = crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);

  // 3. Tạo một Initialization Vector (IV) ngẫu nhiên
  const iv = crypto.randomBytes(IV_LENGTH);

  // 4. Tạo đối tượng cipher và thực hiện mã hóa
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 5. Trả về dữ liệu đã mã hóa cùng với salt và iv (dưới dạng hex để dễ lưu)
  return {
    encryptedData: encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex')
  };
};

/**
 * Giải mã một chuỗi đã được mã hóa bằng AES-256-CBC.
 * 
 * @param {string} encryptedDataHex - Dữ liệu đã mã hóa (dạng hex).
 * @param {string} passphrase - Cụm mật khẩu đã dùng để mã hóa.
 * @param {string} saltHex - Salt (dạng hex) đã dùng để mã hóa.
 * @param {string} ivHex - IV (dạng hex) đã dùng để mã hóa.
 * @returns {string} - Chuỗi đã được giải mã.
 * @throws {Error} - Ném lỗi nếu giải mã thất bại (ví dụ: sai passphrase).
 */
const decryptPrivateKey = (encryptedDataHex, passphrase, saltHex, ivHex) => {
  try {
    // 1. Chuyển đổi salt và iv từ hex trở lại dạng Buffer
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    // 2. Tái tạo lại chính xác key mã hóa từ passphrase và salt
    const key = crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
    
    // 3. Tạo đối tượng decipher và thực hiện giải mã
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // 4. Trả về chuỗi gốc
    return decrypted;
  } catch (error) {
    // Bắt lỗi và ném ra một lỗi rõ ràng hơn
    // Lỗi 'bad decrypt' thường xảy ra khi key (passphrase) hoặc IV không chính xác.
    console.error("Decryption failed:", error.message);
    throw new Error('Decryption failed. This is likely due to an incorrect passphrase or corrupted data.');
  }
};

// Export các hàm để có thể sử dụng ở nơi khác
module.exports = {
  encryptPrivateKey,
  decryptPrivateKey
};