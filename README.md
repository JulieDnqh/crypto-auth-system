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

- M.Sc. Le Giang Thanh
- Department of Computer Networking, University of Science – VNU-HCM

---

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

---

## 🚀 Getting Started: How to Run the System

Follow these steps to set up and run the project on your local machine.

### 1. 📦 Prerequisites

Make sure you have the following software installed:

- **Node.js**: Version 18.x or higher  
- **npm**: Version 9.x or higher *(comes with Node.js)*  
- **SQL Server**: SQL Server 2019+ (Developer or Express Edition)  
- **Git**: For cloning the repository

---

### 2. ⚙️ Installation and Setup

#### 🔹 Step 1: Clone the Repository

```bash
git clone https://github.com/JulieDnqh/crypto-auth-system.git
cd CryptoAuthSystem
```

---

#### 🔹 Step 2: Install Dependencies

This project is a monorepo managed with **npm workspaces**. To install all dependencies (frontend + backend):

```bash
npm install
```

---

#### 🔹 Step 3: Database Setup

##### a. Create the Database:

- Open **SQL Server Management Studio (SSMS)**
- Create a new database named: `CryptoAuthDB`

##### b. Create SQL Server Login:

- Go to `Security > Logins`
- Create a new SQL Server login (e.g.,  
  user: `crypto_user`,  
  password: `your_strong_password`)
- In **User Mapping** tab, map this login to `CryptoAuthDB` and grant it `db_owner`

##### c. Enable TCP/IP Protocol:

- Open **SQL Server Configuration Manager**
- Go to:  
  `SQL Server Network Configuration > Protocols for MSSQLSERVER`
- Ensure **TCP/IP** is enabled
- Restart SQL Server service if needed

##### d. Configure Windows Firewall:

- Open **Windows Defender Firewall with Advanced Security**
- Add a new **Inbound Rule** to allow TCP port `1433`

---

#### 🔹 Step 4: Configure Environment Variables

##### a. Create `.env` file in root directory:

```
CryptoAuthSystem/.env
```

##### b. Add database connection string:

```ini
# File: .env
DATABASE_URL="sqlserver://YOUR_SERVER_IP:1433;database=CryptoAuthDB;user=YOUR_SQL_USER;password=YOUR_SQL_PASSWORD;encrypt=false;trustServerCertificate=true"
```

Replace the placeholders:

- `YOUR_SERVER_IP`: e.g. `localhost` or `127.0.0.1`
- `YOUR_SQL_USER`: SQL login name
- `YOUR_SQL_PASSWORD`: SQL login password

---

#### 🔹 Step 5: Run Database Migrations

This will create necessary tables (e.g., `Users`) using Prisma:

```bash
npx prisma migrate dev
```

> When prompted, name the migration (e.g., `initial-setup`)

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

