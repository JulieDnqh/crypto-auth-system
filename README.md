# 🔐 CryptoAuthSystem - Secure Authentication & File Encryption System

This is a project for the **Computer Security** course, simulating a secure web application with features such as user registration, multi-factor authentication (OTP/TOTP), RSA key management, file encryption, digital signatures, QR code generation and scanning, account role management, activity logging, and account recovery.

---

## 👥 Team Members

| Name                    | Student ID | Role                                                 |
| ----------------------- | ---------- | ---------------------------------------------------- |
| Dinh Nguyen Quynh Huong | 22127146   | Frontend (React), MFA implementation, UI             |
| Vo Ho Bao Long          | 22127251   | QR code generation, Logging activities               |
| Diep Gia Huy            | 22127475   | RSA/AES encryption, Digital signature & verification |

---

## 👨‍🏫 Lecturer

- M.Sc. Le Giang Thanh
- Department of Computer Networking, University of Science – VNU-HCM

---

## 🛠️ Technologies Used

| Component    | Technologies                              |
| ------------ | ----------------------------------------- |
| Frontend     | React, HTML/CSS/JS, Axios                 |
| Backend      | Node.js, Express.js, JWT                  |
| Database     | SQL Server                                |
| Cryptography | AES, RSA (Node.js `crypto` module)        |
| MFA          | OTP (random), TOTP (Google Authenticator) |
| QR code      | `qrcode` library, JS QR scanner           |
| UI           | React + CSS                               |
| Logging      | Stored in SQL Server (`Logs` table)       |

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

---

## 🚀 Getting Started: How to Run the System

Follow these steps to set up and run the project on your local machine.

### 1. 📦 Prerequisites

Make sure you have the following software installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher _(comes with Node.js)_
- **SQL Server**: SQL Server 2019+ (Developer or Express Edition)
- **Git**: For cloning the repository

---

### 2. ⚙️ Installation and Setup

#### 🔹 Step 1: Clone the Repository

```bash
git clone https://github.com/JulieDnqh/crypto-auth-system.git
cd CryptoAuthSystem
```

or

```bash
git clone -b main https://github.com/JulieDnqh/crypto-auth-system.git .
```

---

#### 🔹 Step 2: Install Dependencies

This project is a monorepo managed with **npm workspaces**. To install all dependencies (frontend + backend):

```bash
npm install
```

---

#### 🔹 Step 3: Database Setup

#### 🔹 Step 1: Configure Environment Variables

##### a. Create `.env` file in root directory:

```
CryptoAuthSystem/.env
```

##### b. Add database connection string:

```ini
# File: .env
DATABASE_URL="mongodb+srv://<db_username>:<db_password>@cryptoauthsystem.rc17tvo.mongodb.net/CryptAuthSystemDB?retryWrites=true&w=majority&appName=CryptoAuthSystem"
```

Replace the placeholders:

---

#### 🔹 Step 5: Run Database Migrations

This will create necessary tables (e.g., `Users`) using Prisma:

```bash
npx prisma db push
```

---

### 3. 🧪 Running the Application

To start both frontend and backend servers **simultaneously**, run:

```bash
npm run dev:all
```

This will:

- 🚀 Start the **Backend Server** at: [http://localhost:5000](http://localhost:5000)
- 🌐 Start the **Frontend (Next.js)** at: [http://localhost:3000](http://localhost:3000)

Now open your browser and visit [http://localhost:3000](http://localhost:3000)  
The frontend will automatically communicate with the backend server.

---
