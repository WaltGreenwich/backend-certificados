import { Router } from "express";
import { validateCertificate } from "../controllers/public.controller";

const router = Router();

router.get("/validate", validateCertificate);

export default router;
