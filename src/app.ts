// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";
import publicRoutes from "./routes/public.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Exponer archivos (PDFs y QR) de forma controlada
app.use("/uploads", express.static("src/uploads"));

// Rutas base
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);

// Ruta por defecto
app.get("/", (req, res) => {
  res.send("API Certificados en funcionamiento ✅");
});

export default app;
