// src/controllers/auth.controller.ts
import { Request, Response, RequestHandler } from "express"; // <--- Add RequestHandler here
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

// Change return type from Promise<Response> to Promise<void>
export const login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  // <--- Changed here
  const { dni, password } = req.body;

  const user = await prisma.user.findUnique({ where: { dni } });

  if (!user) {
    res.status(401).json({ message: "Usuario no encontrado" });
    return; // <--- Add return to exit function after sending response
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Contraseña incorrecta" });
    return; // <--- Add return to exit function after sending response
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.status(200).json({
    // <--- No need for 'return' here
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      dni: user.dni,
      role: user.role,
    },
  });
  // No explicit 'return' needed at the end, as the function implicitly finishes after sending response
};
