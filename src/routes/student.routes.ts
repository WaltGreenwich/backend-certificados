import { Router } from "express";
import {
  studentLogin,
  getMyCourses,
  downloadCertificate,
} from "../controllers/student.controller";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Login alumno
router.post("/login", studentLogin);

// Cursos del alumno
router.get("/courses", verifyToken, getMyCourses);

// Ruta de descarga
router.get("/courses/:code/download", verifyToken, downloadCertificate);

export default router;
