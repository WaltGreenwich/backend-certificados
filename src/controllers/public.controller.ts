import { Request, Response } from "express";
import prisma from "../config/prisma";

export const validateCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { q: code, dni } = req.query;

  if (!code || !dni) {
    res.status(400).json({ message: "Código de curso y DNI requeridos." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { dni: String(dni) } });
    if (!user) {
      res.status(404).json({ message: "Alumno no encontrado." });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { code: String(code) },
    });
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado." });
      return;
    }

    const assignment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!assignment) {
      res
        .status(404)
        .json({ message: "No hay relación entre el alumno y el curso." });
      return;
    }

    res.status(200).json({
      fullName: user.fullName,
      dni: user.dni,
      course: {
        name: course.name,
        code: course.code,
        startDate: course.startDate,
        endDate: course.endDate,
      },
      certificateAvailable: !!assignment.certificatePath,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en la validación.", error });
  }
};
