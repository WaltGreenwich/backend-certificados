import { Router } from "express";
import {
  createStudent,
  createCourse,
  assignStudentToCourse,
} from "../controllers/admin.controller";

const router = Router();

router.post("/users", createStudent);
router.post("/courses", createCourse);
router.post("/assign", assignStudentToCourse);

export default router;
