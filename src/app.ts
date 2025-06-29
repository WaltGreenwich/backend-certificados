// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";
import validatorRoutes from "./routes/validator.routes";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Exponer archivos (PDFs y QR) de forma controlada
app.use("/uploads", express.static("src/uploads"));

// Rutas base
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/validate", validatorRoutes);

// Ruta por defecto
app.get("/", (req, res) => {
  res.send("API Certificados en funcionamiento ✅");
});

export default app;
