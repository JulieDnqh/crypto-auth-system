const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép request từ mọi nguồn (chỉnh lại cho production)
app.use(express.json()); // Để đọc được body dạng JSON

// Routes
const authRoutes = require('./modules/routes/authRoutes');
app.use('/api/auth', authRoutes); // Tất cả các route trong authRoutes sẽ có tiền tố /api/auth

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});