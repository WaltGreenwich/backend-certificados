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
exports.validateCertificate = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const validateCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q: code, dni } = req.query;
    if (!code || !dni) {
        res.status(400).json({ message: "Código de curso y DNI requeridos." });
        return;
    }
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { dni: String(dni) } });
        if (!user) {
            res.status(404).json({ message: "Alumno no encontrado." });
            return;
        }
        const course = yield prisma_1.default.course.findUnique({
            where: { code: String(code) },
        });
        if (!course) {
            res.status(404).json({ message: "Curso no encontrado." });
            return;
        }
        const assignment = yield prisma_1.default.userCourse.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error en la validación.", error });
    }
});
exports.validateCertificate = validateCertificate;
