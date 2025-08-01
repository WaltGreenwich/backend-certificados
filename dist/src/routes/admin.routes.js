"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
router.post("/users", admin_controller_1.createStudent);
router.post("/courses", admin_controller_1.createCourse);
router.post("/assign", admin_controller_1.assignStudentToCourse);
router.post("/generate-qr", admin_controller_1.generateQR);
router.post("/upload-certificate", multer_1.upload.single("certificate"), admin_controller_1.uploadCertificate);
exports.default = router;
