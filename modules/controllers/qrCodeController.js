const qrcode = require("qrcode");
const jsqr = require("jsqr");
const { createCanvas, loadImage } = require("canvas");
const prisma = require("../config/db");
const log = require("../utils/logger");

exports.generateQrCode = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Lấy thông tin user và khóa RSA của họ
    const userWithKey = await prisma.user.findUnique({
      where: { id: userId },
      include: { rsaKey: true },
    });

    if (!userWithKey || !userWithKey.rsaKey) {
      return res
        .status(404)
        .json({ message: "Public key not found for this user." });
    }

    const { publicKey, createdAt } = userWithKey.rsaKey;
    const userEmail = userWithKey.email;

    // Dữ liệu để mã hóa vào QR code
    const qrData = JSON.stringify({
      email: userEmail,
      publicKey: publicKey,
      createdAt: createdAt.toISOString(), // Chuyển sang định dạng ISO cho nhất quán
    });

    // Tạo QR code dưới dạng Data URL
    const qrCodeUrl = await qrcode.toDataURL(qrData);

    log(
      userEmail,
      "Generate QR Code",
      "Success",
      "QR code generated successfully"
    );
    res.status(200).json({ qrCodeUrl });
  } catch (error) {
    console.error("Error generating QR code:", error);
    log(req.user.email, "Generate QR Code", "Failed", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.decodeQrCode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No QR code image uploaded." });
    }

    const imageBuffer = req.file.buffer;
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsqr(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const decodedData = JSON.parse(code.data);

        log(
          req.user.email,
          "Decode QR Code",
          "Success",
          "QR code decoded successfully"
        );
        res.status(200).json({ decodedData });
      } catch (parseError) {
        // If it's not JSON, return as plain text
        log(
          req.user.email,
          "Decode QR Code",
          "Success",
          "QR code decoded as plain text"
        );
        res.status(200).json({ decodedData: code.data });
      }
    } else {
      log(
        req.user.email,
        "Decode QR Code",
        "Failed",
        "No QR code found in the image"
      );
      res.status(400).json({ message: "No QR code found in the image." });
    }
  } catch (error) {
    console.error("Error decoding QR code:", error);
    log(req.user.email, "Decode QR Code", "Failed", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
