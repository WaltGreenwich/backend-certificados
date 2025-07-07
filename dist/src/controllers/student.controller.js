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
exports.downloadCertificate = exports.getMyCourses = exports.studentLogin = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_service_1 = require("../services/auth.service");
const JWT_SECRET = process.env.JWT_SECRET || "secreto";
const studentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni, password } = req.body;
    const student = yield prisma_1.default.user.findUnique({ where: { dni } });
    if (!student || student.role !== "student") {
        res.status(401).json({ message: "Credenciales inválidas." });
        return;
    }
    const valid = yield (0, auth_service_1.comparePassword)(password, student.password);
    if (!valid) {
        res.status(401).json({ message: "Credenciales inválidas." });
        return;
    }
    const token = (0, auth_service_1.createToken)({
        userId: student.id,
        dni: student.dni,
        role: student.role,
    });
    res.status(200).json({ token });
});
exports.studentLogin = studentLogin;
const getMyCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const user = yield prisma_1.default.user.findUnique({
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
        const courses = user.courses.map((uc) => {
            var _a;
            return ({
                name: uc.course.name,
                code: uc.course.code,
                startDate: uc.course.startDate,
                endDate: uc.course.endDate,
                certificate: (_a = uc.certificatePath) !== null && _a !== void 0 ? _a : null,
            });
        });
        res.status(200).json({ fullName: user.fullName, dni: user.dni, courses });
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener cursos.", error });
    }
});
exports.getMyCourses = getMyCourses;
const downloadCertificate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { code } = req.params;
    try {
        const course = yield prisma_1.default.course.findUnique({ where: { code } });
        if (!course) {
            res.status(404).json({ message: "Curso no encontrado." });
            return;
        }
        const assignment = yield prisma_1.default.userCourse.findUnique({
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
        const filePath = path_1.default.resolve(assignment.certificatePath);
        if (!fs_1.default.existsSync(filePath)) {
            res
                .status(404)
                .json({ message: "Archivo de certificado no encontrado." });
            return;
        }
        res.download(filePath, `${code}_certificado.pdf`);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error al descargar el certificado.", error });
    }
});
exports.downloadCertificate = downloadCertificate;
