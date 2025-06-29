import { Router } from "express";

const router = Router();

// Ruta de prueba
router.get("/ping", (req, res) => {
  res.json({ message: "Validator OK ✅" });
});

export default router;
