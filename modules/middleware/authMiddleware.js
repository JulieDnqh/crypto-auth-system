const jwt = require("jsonwebtoken");

const getAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Xác minh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Gắn thông tin người dùng vào request
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      res.status(401).json({ message: "Không được phép, token không hợp lệ." });
    }
  } else {
    res.status(401).json({ message: "Không được phép, không có token." });
  }
};

module.exports = { getAuth };
