import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "secreto";

export const studentLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, password } = req.body;

  if (!dni || !password) {
    res.status(400).json({ message: "DNI y contraseña son obligatorios." });
    return;
  }

  try {
    const student = await prisma.user.findUnique({ where: { dni } });

    if (!student || student.role !== "student") {
      res.status(401).json({ message: "Credenciales inválidas." });
      return;
    }

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) {
      res.status(401).json({ message: "Credenciales inválidas." });
      return;
    }

    const token = jwt.sign(
      { userId: student.id, dni: student.dni, role: student.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión.", error });
  }
};

export const getMyCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado." });
      return;
    }

    const courses = user.courses.map((uc) => ({
      name: uc.course.name,
      code: uc.course.code,
      startDate: uc.course.startDate,
      endDate: uc.course.endDate,
      certificate: uc.certificatePath ?? null,
    }));

    res.status(200).json({ fullName: user.fullName, dni: user.dni, courses });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cursos.", error });
  }
};

export const downloadCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { code } = req.params;

  try {
    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado." });
      return;
    }

    const assignment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (!assignment || !assignment.certificatePath) {
      res.status(404).json({ message: "Certificado no disponible." });
      return;
    }

    const filePath = path.resolve(assignment.certificatePath);
    if (!fs.existsSync(filePath)) {
      res
        .status(404)
        .json({ message: "Archivo de certificado no encontrado." });
      return;
    }

    res.download(filePath, `${code}_certificado.pdf`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al descargar el certificado.", error });
  }
};
