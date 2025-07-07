import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
      where: { dni: "99999999" },
      update: {},
      create: {
        fullName: "Administrador",
        dni: "99999999",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin creado con éxito.");
    process.exit();
  } catch (err) {
    console.error("❌ Error al crear admin:", err);
    process.exit(1);
  }
};

createAdmin();
