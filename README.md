# 🔐 CryptoAuthSystem - Secure Authentication & File Encryption System

This is a project for the **Computer Security** course, simulating a secure web application with features such as user registration, multi-factor authentication (OTP/TOTP), RSA key management, file encryption, digital signatures, QR code generation and scanning, account role management, activity logging, and account recovery.

---

## 👥 Team Members

| Name                       | Student ID | Role                                                 |
|----------------------------|------------|------------------------------------------------------|
| Dinh Nguyen Quynh Huong    | 22127146   | Frontend (React), MFA implementation, UI             |
| Vo Ho Bao Long             | 22127251   | QR code generation, Logging activities               |
| Diep Gia Huy               | 22127475   | RSA/AES encryption, Digital signature & verification |

---

## 👨‍🏫 Lecturer

- Mr. Le Giang Thanh
- Department of Computer Networking, University of Science – VNU-HCM

## 🛠️ Technologies Used

| Component        | Technologies                               |
|------------------|--------------------------------------------|
| Frontend         | React, HTML/CSS/JS, Axios                  |
| Backend          | Node.js, Express.js, JWT                   |
| Database         | SQL Server                                 |
| Cryptography     | AES, RSA (Node.js `crypto` module)         |
| MFA              | OTP (random), TOTP (Google Authenticator)  |
| QR code          | `qrcode` library, JS QR scanner            |
| UI               | React + CSS                                |
| Logging          | Stored in SQL Server (`Logs` table)        |

---

## 🧩 Key Features

- ✅ User registration, login, and multi-factor authentication (OTP/TOTP)
- 🔐 RSA key generation, encryption, and status checking
- 📦 File encryption and sharing using AES + RSA
- ✍️ Digital signing and signature verification
- 📷 QR code creation and scanning (for public keys)
- 👤 Update user profile and passphrase (secure key re-encryption)
- 🧑‍💼 User/Admin role management and admin dashboard
- 📄 Security activity logging
- 🧨 Login rate limiting and account recovery via recovery code