"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCertificate = exports.generateQR = exports.assignStudentToCourse = exports.createCourse = exports.createStudent = void 0;
const client_1 = require("@prisma/client");
const qr_service_1 = require("../services/qr.service");
const path_1 = __importDefault(require("path"));
const auth_service_1 = require("../services/auth.service");
const prisma = new client_1.PrismaClient();
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, dni } = req.body;
    const existingUser = yield prisma.user.findUnique({ where: { dni } });
    if (existingUser) {
        res.status(400).json({ message: "DNI ya registrado." });
        return;
    }
    const passwordHash = yield (0, auth_service_1.hashPassword)(dni); // DNI como contraseña inicial
    const user = yield prisma.user.create({
        data: {
            fullName,
            dni,
            password: passwordHash,
            role: "student",
        },
    });
    res.status(201).json({ message: "Alumno creado", user });
});
exports.createStudent = createStudent;
// Crear curso
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, code, startDate, endDate } = req.body;
    if (!name || !code || !startDate || !endDate) {
        res.status(400).json({ message: "Todos los campos son obligatorios." });
        return;
    }
    try {
        // Validar si ya existe el código
        const existing = yield prisma.course.findUnique({ where: { code } });
        if (existing) {
            res.status(409).json({ message: "El código del curso ya existe." });
            return;
        }
        const newCourse = yield prisma.course.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error al crear el curso.", error });
    }
});
exports.createCourse = createCourse;
// Asignar alumno a curso
const assignStudentToCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni, code } = req.body;
    if (!dni || !code) {
        res
            .status(400)
            .json({ message: "DNI y código del curso son obligatorios." });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { dni } });
        if (!user) {
            res.status(404).json({ message: "Alumno no encontrado." });
            return;
        }
        const course = yield prisma.course.findUnique({ where: { code } });
        if (!course) {
            res.status(404).json({ message: "Curso no encontrado." });
            return;
        }
        // Verificar si ya fue asignado
        const existingAssignment = yield prisma.userCourse.findUnique({
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
        yield prisma.userCourse.create({
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
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error al asignar alumno a curso.", error });
    }
});
exports.assignStudentToCourse = assignStudentToCourse;
// Generar QR para alumno asignado a curso
const generateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni, code } = req.body;
    if (!dni || !code) {
        res
            .status(400)
            .json({ message: "DNI y código del curso son obligatorios." });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { dni } });
        if (!user) {
            res.status(404).json({ message: "Alumno no encontrado." });
            return;
        }
        const course = yield prisma.course.findUnique({ where: { code } });
        if (!course) {
            res.status(404).json({ message: "Curso no encontrado." });
            return;
        }
        const assignment = yield prisma.userCourse.findUnique({
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
        const qrPath = yield (0, qr_service_1.generateQRImage)(qrData, qrFilename);
        yield prisma.userCourse.update({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error al generar el QR.", error });
    }
});
exports.generateQR = generateQR;
// Subir certificado PDF
const uploadCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni, code } = req.body;
    if (!req.file) {
        res.status(400).json({ message: "No se envió ningún archivo." });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { dni } });
        const course = yield prisma.course.findUnique({ where: { code } });
        if (!user || !course) {
            res.status(404).json({ message: "Alumno o curso no encontrado." });
            return;
        }
        const assignment = yield prisma.userCourse.findUnique({
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
            res.status(400).json({
                message: "Primero debes generar el QR antes de subir el certificado.",
            });
            return;
        }
        const certPath = path_1.default.join("src", "uploads", "certificates", req.file.filename);
        yield prisma.userCourse.update({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error al subir el certificado.", error });
    }
});
exports.uploadCertificate = uploadCertificate;
