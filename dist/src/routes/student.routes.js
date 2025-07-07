"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Login alumno
router.post("/login", student_controller_1.studentLogin);
// Cursos del alumno
router.get("/courses", auth_1.verifyToken, student_controller_1.getMyCourses);
// Ruta de descarga
router.get("/courses/:code/download", auth_1.verifyToken, student_controller_1.downloadCertificate);
exports.default = router;
