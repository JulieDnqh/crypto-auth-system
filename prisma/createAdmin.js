const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Lấy email từ đối số dòng lệnh
const email = process.argv[2];

if (!email) {
  console.error(
    "Lỗi: Vui lòng cung cấp email của người dùng cần cấp quyền admin."
  );
  console.log("Cách dùng: node prisma/createAdmin.js <email_cua_user>");
  process.exit(1);
}

async function main() {
  try {
    // Tìm người dùng trong database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.error(`Lỗi: Không tìm thấy người dùng với email: ${email}`);
      return;
    }

    // Cập nhật vai trò của người dùng thành ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { role: "ADMIN" },
    });

    console.log(
      `Thành công! Đã cập nhật vai trò cho người dùng ${updatedUser.email} thành ${updatedUser.role}.`
    );
  } catch (e) {
    console.error("Đã xảy ra lỗi khi cập nhật người dùng:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
