import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { generateQRImage } from "../services/qr.service";
import path from "path";

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullName, dni, password } = req.body;

  if (!fullName || !dni || !password) {
    res.status(400).json({ message: "Todos los campos son obligatorios." });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { dni } });
    if (existing) {
      res.status(409).json({ message: "El DNI ya está registrado." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await prisma.user.create({
      data: {
        fullName,
        dni,
        password: hashedPassword,
        role: "student",
      },
    });

    res.status(201).json({
      message: "Alumno creado correctamente.",
      student: {
        id: newStudent.id,
        fullName: newStudent.fullName,
        dni: newStudent.dni,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el alumno.", error });
  }
};

// Crear curso
export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, code, startDate, endDate } = req.body;

  if (!name || !code || !startDate || !endDate) {
    res.status(400).json({ message: "Todos los campos son obligatorios." });
    return;
  }

  try {
    // Validar si ya existe el código
    const existing = await prisma.course.findUnique({ where: { code } });
    if (existing) {
      res.status(409).json({ message: "El código del curso ya existe." });
      return;
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({
      message: "Curso creado correctamente.",
      course: {
        id: newCourse.id,
        name: newCourse.name,
        code: newCourse.code,
        startDate: newCourse.startDate,
        endDate: newCourse.endDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el curso.", error });
  }
};

// Asignar alumno a curso
export const assignStudentToCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, code } = req.body;

  if (!dni || !code) {
    res
      .status(400)
      .json({ message: "DNI y código del curso son obligatorios." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { dni } });
    if (!user) {
      res.status(404).json({ message: "Alumno no encontrado." });
      return;
    }

    const course = await prisma.course.findUnique({ where: { code } });
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado." });
      return;
    }

    // Verificar si ya fue asignado
    const existingAssignment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingAssignment) {
      res
        .status(409)
        .json({ message: "Este alumno ya está asignado a este curso." });
      return;
    }

    await prisma.userCourse.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
    });

    res.status(201).json({
      message: "Alumno asignado al curso correctamente.",
      user: user.fullName,
      course: course.name,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al asignar alumno a curso.", error });
  }
};

// Generar QR para alumno asignado a curso
export const generateQR = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, code } = req.body;

  if (!dni || !code) {
    res
      .status(400)
      .json({ message: "DNI y código del curso son obligatorios." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { dni } });
    if (!user) {
      res.status(404).json({ message: "Alumno no encontrado." });
      return;
    }

    const course = await prisma.course.findUnique({ where: { code } });
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
        .json({ message: "El alumno no está asignado a este curso." });
      return;
    }

    if (assignment.qrGenerated) {
      res
        .status(400)
        .json({ message: "El QR ya fue generado para este alumno y curso." });
      return;
    }

    const qrData = `https://midominio.com/validate?q=${code}&dni=${dni}`;
    const qrFilename = `${dni}_${code}`;
    const qrPath = await generateQRImage(qrData, qrFilename);

    await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      data: {
        qrPath,
        qrGenerated: true,
      },
    });

    res.status(200).json({
      message: "QR generado correctamente.",
      qrPath,
      qrData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el QR.", error });
  }
};

// Subir certificado PDF
export const uploadCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, code } = req.body;

  if (!req.file) {
    res.status(400).json({ message: "No se envió ningún archivo." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { dni } });
    const course = await prisma.course.findUnique({ where: { code } });

    if (!user || !course) {
      res.status(404).json({ message: "Alumno o curso no encontrado." });
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
        .json({ message: "El alumno no está asignado a este curso." });
      return;
    }

    if (!assignment.qrGenerated) {
      res
        .status(400)
        .json({
          message: "Primero debes generar el QR antes de subir el certificado.",
        });
      return;
    }

    const certPath = path.join(
      "src",
      "uploads",
      "certificates",
      req.file.filename
    );

    await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      data: {
        certificatePath: certPath,
      },
    });

    res.status(200).json({
      message: "Certificado subido correctamente.",
      path: certPath,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al subir el certificado.", error });
  }
};
