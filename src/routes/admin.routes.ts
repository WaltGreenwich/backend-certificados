import { Router } from "express";
import {
  createStudent,
  createCourse,
  assignStudentToCourse,
  generateQR,
  uploadCertificate,
} from "../controllers/admin.controller";
import { upload } from "../config/multer";

const router = Router();

router.post("/users", createStudent);
router.post("/courses", createCourse);
router.post("/assign", assignStudentToCourse);
router.post("/generate-qr", generateQR);
router.post(
  "/upload-certificate",
  upload.single("certificate"),
  uploadCertificate
);

export default router;
